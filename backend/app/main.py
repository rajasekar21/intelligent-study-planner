from collections import defaultdict

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .ai import build_week_dates, calculate_priority
from .auth import create_access_token, hash_password, verify_password
from .database import Base, engine, get_db
from .models import Doubt, StudyTask, Topic, User
from .schemas import (
    DoubtCreate,
    DoubtOut,
    DoubtUpdate,
    LoginRequest,
    TaskOut,
    TaskStatusUpdate,
    TopicCreate,
    TopicOut,
    UserCreate,
    UserOut,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent Study Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}


@app.post("/topics", response_model=TopicOut)
def create_topic(payload: TopicCreate, student_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id).first()
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    topic = Topic(
        student_id=student_id,
        subject=payload.subject,
        title=payload.title,
        deadline=payload.deadline,
        difficulty=payload.difficulty,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@app.get("/topics", response_model=list[TopicOut])
def get_topics(student_id: int = Query(...), db: Session = Depends(get_db)):
    return db.query(Topic).filter(Topic.student_id == student_id).order_by(Topic.deadline.asc()).all()


@app.post("/planner/generate", response_model=list[TaskOut])
def generate_week_plan(student_id: int = Query(...), db: Session = Depends(get_db)):
    topics = (
        db.query(Topic)
        .filter(Topic.student_id == student_id, Topic.is_completed.is_(False))
        .order_by(Topic.deadline.asc())
        .all()
    )
    if not topics:
        return []

    db.query(StudyTask).filter(StudyTask.student_id == student_id).delete()
    db.commit()

    week_dates = build_week_dates()
    by_day_hours = defaultdict(int)
    max_hours_per_day = 3

    created_tasks: list[StudyTask] = []
    for topic in topics:
        unresolved = db.query(Doubt).filter(Doubt.topic_id == topic.id, Doubt.status != "resolved").count()
        score = calculate_priority(topic.deadline, topic.difficulty, unresolved)

        for day in week_dates:
            if by_day_hours[day] < max_hours_per_day:
                task = StudyTask(
                    student_id=student_id,
                    topic_id=topic.id,
                    task_date=day,
                    hours_planned=1,
                    status="pending",
                    priority_score=score,
                )
                db.add(task)
                created_tasks.append(task)
                by_day_hours[day] += 1
                break

    db.commit()
    for task in created_tasks:
        db.refresh(task)
    return created_tasks


@app.get("/planner/week", response_model=list[TaskOut])
def get_week_plan(student_id: int = Query(...), db: Session = Depends(get_db)):
    return (
        db.query(StudyTask)
        .filter(StudyTask.student_id == student_id)
        .order_by(StudyTask.task_date.asc(), StudyTask.priority_score.desc())
        .all()
    )


@app.patch("/planner/task/{task_id}", response_model=TaskOut)
def update_task_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task


@app.post("/doubts", response_model=DoubtOut)
def create_doubt(payload: DoubtCreate, student_id: int = Query(...), db: Session = Depends(get_db)):
    doubt = Doubt(
        student_id=student_id,
        topic_id=payload.topic_id,
        title=payload.title,
        description=payload.description,
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)
    return doubt


@app.get("/doubts", response_model=list[DoubtOut])
def get_doubts(student_id: int = Query(...), db: Session = Depends(get_db)):
    return db.query(Doubt).filter(Doubt.student_id == student_id).order_by(Doubt.id.desc()).all()


@app.patch("/doubts/{doubt_id}", response_model=DoubtOut)
def update_doubt(doubt_id: int, payload: DoubtUpdate, db: Session = Depends(get_db)):
    doubt = db.query(Doubt).filter(Doubt.id == doubt_id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")
    doubt.status = payload.status
    doubt.mentor_comment = payload.mentor_comment
    db.commit()
    db.refresh(doubt)
    return doubt


@app.get("/insights/student/{student_id}")
def student_insights(student_id: int, db: Session = Depends(get_db)):
    total = db.query(StudyTask).filter(StudyTask.student_id == student_id).count()
    completed = (
        db.query(StudyTask)
        .filter(StudyTask.student_id == student_id, StudyTask.status == "completed")
        .count()
    )
    missed = (
        db.query(StudyTask).filter(StudyTask.student_id == student_id, StudyTask.status == "missed").count()
    )
    open_doubts = (
        db.query(Doubt).filter(Doubt.student_id == student_id, Doubt.status != "resolved").count()
    )
    completion_rate = round((completed / total) * 100, 2) if total else 0.0
    risk = "low"
    if missed >= 3 or completion_rate < 40:
        risk = "high"
    elif missed >= 1 or completion_rate < 70:
        risk = "medium"
    return {
        "student_id": student_id,
        "total_tasks": total,
        "completed_tasks": completed,
        "missed_tasks": missed,
        "open_doubts": open_doubts,
        "completion_rate": completion_rate,
        "risk_level": risk,
    }
