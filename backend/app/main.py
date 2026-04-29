import os
from datetime import date

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, require_role, verify_password
from .database import Base, engine, get_db
from .models import AIUsageLog, Doubt, StudyTask, Topic, User
from .schemas import (
    AIUsageLogCreate,
    AIUsageLogOut,
    DoubtCreate,
    DoubtOut,
    DoubtUpdate,
    LoginRequest,
    TaskOut,
    TaskStatusUpdate,
    TopicCreate,
    TopicOut,
    TopicUpdate,
    UserCreate,
    UserOut,
)

load_dotenv()
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent Study Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(_request, _exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


def ensure_same_user_or_admin(current_user: User, student_id: int) -> None:
    if current_user.role == "admin":
        return
    if current_user.id != student_id:
        raise HTTPException(status_code=403, detail="You can only access your own data")


def ensure_student(current_user: User) -> None:
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only student role can perform this action")


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
def create_topic(
    payload: TopicCreate,
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    target_user = db.query(User).filter(User.id == student_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Student not found")
    ensure_student(target_user)
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
def get_topics(
    student_id: int = Query(...),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    query = db.query(Topic).filter(Topic.student_id == student_id)
    if search:
        text = f"%{search.strip()}%"
        query = query.filter((Topic.subject.ilike(text)) | (Topic.title.ilike(text)))
    return query.order_by(Topic.deadline.asc()).all()


@app.put("/topics/{topic_id}", response_model=TopicOut)
def update_topic(
    topic_id: int,
    payload: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    ensure_same_user_or_admin(current_user, topic.student_id)
    topic.subject = payload.subject
    topic.title = payload.title
    topic.deadline = payload.deadline
    topic.difficulty = payload.difficulty
    topic.is_completed = payload.is_completed
    db.commit()
    db.refresh(topic)
    return topic


@app.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    ensure_same_user_or_admin(current_user, topic.student_id)
    db.query(StudyTask).filter(StudyTask.topic_id == topic.id).delete()
    db.query(Doubt).filter(Doubt.topic_id == topic.id).delete()
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted"}


@app.post("/planner/generate", response_model=list[TaskOut])
def generate_week_plan(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
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

    ai_topics = []
    for topic in topics:
        unresolved = db.query(Doubt).filter(Doubt.topic_id == topic.id, Doubt.status != "resolved").count()
        ai_topics.append(
            {
                "topic_id": topic.id,
                "deadline": str(topic.deadline),
                "difficulty": topic.difficulty,
                "unresolved_doubts": unresolved,
            }
        )

    try:
        response = httpx.post(
            f"{AI_SERVICE_URL}/generate-plan",
            json={"student_id": student_id, "topics": ai_topics},
            timeout=20.0,
        )
        response.raise_for_status()
        plan_payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="AI planning service unavailable") from exc

    created_tasks: list[StudyTask] = []
    for item in plan_payload:
        task = StudyTask(
            student_id=item["student_id"],
            topic_id=item["topic_id"],
            task_date=date.fromisoformat(item["task_date"]),
            hours_planned=item["hours_planned"],
            status=item["status"],
            priority_score=item["priority_score"],
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()
    for task in created_tasks:
        db.refresh(task)
    return created_tasks


@app.get("/planner/week", response_model=list[TaskOut])
def get_week_plan(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    return (
        db.query(StudyTask)
        .filter(StudyTask.student_id == student_id)
        .order_by(StudyTask.task_date.asc(), StudyTask.priority_score.desc())
        .all()
    )


@app.patch("/planner/task/{task_id}", response_model=TaskOut)
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    ensure_same_user_or_admin(current_user, task.student_id)
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task


@app.post("/doubts", response_model=DoubtOut)
def create_doubt(
    payload: DoubtCreate,
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
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
def get_doubts(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    return db.query(Doubt).filter(Doubt.student_id == student_id).order_by(Doubt.id.desc()).all()


@app.patch("/doubts/{doubt_id}", response_model=DoubtOut)
def update_doubt(
    doubt_id: int,
    payload: DoubtUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("mentor", "admin")),
):
    doubt = db.query(Doubt).filter(Doubt.id == doubt_id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")
    doubt.status = payload.status
    doubt.mentor_comment = payload.mentor_comment
    db.commit()
    db.refresh(doubt)
    return doubt


@app.get("/insights/student/{student_id}")
def student_insights(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
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


@app.post("/ai-logs", response_model=AIUsageLogOut)
def create_ai_log(
    payload: AIUsageLogCreate,
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    log = AIUsageLog(
        student_id=student_id,
        tool_name=payload.tool_name,
        prompt_text=payload.prompt_text,
        completion_summary=payload.completion_summary,
        action_taken=payload.action_taken,
        files_impacted=payload.files_impacted,
        used_in_code=payload.used_in_code,
        notes=payload.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@app.get("/ai-logs", response_model=list[AIUsageLogOut])
def get_ai_logs(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    return db.query(AIUsageLog).filter(AIUsageLog.student_id == student_id).order_by(AIUsageLog.id.desc()).all()


@app.delete("/ai-logs/{log_id}")
def delete_ai_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(AIUsageLog).filter(AIUsageLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="AI log not found")
    ensure_same_user_or_admin(current_user, log.student_id)
    db.delete(log)
    db.commit()
    return {"message": "AI log deleted"}


@app.get("/ai-logs/export")
def export_ai_logs_markdown(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_same_user_or_admin(current_user, student_id)
    logs = db.query(AIUsageLog).filter(AIUsageLog.student_id == student_id).order_by(AIUsageLog.id.asc()).all()
    lines = [
        "# AI Usage Log",
        "",
        "| Date | Tool | Prompt Summary | Output Used? | Files Impacted | Action Taken | Notes |",
        "|---|---|---|---|---|---|---|",
    ]
    for log in logs:
        used_text = "Yes" if log.used_in_code else "No"
        prompt = (log.prompt_text or "").replace("\n", " ").replace("|", "\\|")
        completion = (log.completion_summary or "").replace("\n", " ").replace("|", "\\|")
        action = (log.action_taken or "").replace("\n", " ").replace("|", "\\|")
        files = (log.files_impacted or "-").replace("\n", " ").replace("|", "\\|")
        notes = (log.notes or "-").replace("\n", " ").replace("|", "\\|")
        date_text = str(getattr(log, "created_at", "") or "")
        lines.append(
            f"| {date_text} | {log.tool_name} | {prompt} / {completion} | {used_text} | {files} | {action} | {notes} |"
        )
    return {"markdown": "\n".join(lines), "count": len(logs)}
