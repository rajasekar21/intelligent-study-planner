from datetime import date, timedelta

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import AIUsageLog, Doubt, StudyTask, Topic, User


def seed_users(db):
    users = [
        ("Student One", "student1@bits.com", "student"),
        ("Mentor One", "mentor1@bits.com", "mentor"),
        ("Admin One", "admin1@bits.com", "admin"),
    ]
    created = {}
    for name, email, role in users:
        row = db.query(User).filter(User.email == email).first()
        if not row:
            row = User(
                name=name,
                email=email,
                password_hash=hash_password("Test@123"),
                role=role,
            )
            db.add(row)
            db.flush()
        created[email] = row
    return created


def seed_topics_tasks_doubts(db, student_id: int):
    if db.query(Topic).filter(Topic.student_id == student_id).count() > 0:
        return

    today = date.today()
    topics = [
        Topic(student_id=student_id, subject="Math", title="Probability Basics", deadline=today + timedelta(days=5), difficulty=3),
        Topic(student_id=student_id, subject="DSA", title="Binary Search", deadline=today + timedelta(days=3), difficulty=2),
        Topic(student_id=student_id, subject="DBMS", title="Normalization", deadline=today + timedelta(days=7), difficulty=4),
    ]
    db.add_all(topics)
    db.flush()

    tasks = [
        StudyTask(
            student_id=student_id,
            topic_id=topics[0].id,
            task_date=today,
            hours_planned=1,
            status="pending",
            priority_score=65,
        ),
        StudyTask(
            student_id=student_id,
            topic_id=topics[1].id,
            task_date=today + timedelta(days=1),
            hours_planned=1,
            status="completed",
            priority_score=72,
        ),
    ]
    db.add_all(tasks)

    doubts = [
        Doubt(
            student_id=student_id,
            topic_id=topics[0].id,
            title="Conditional probability confusion",
            description="Need help understanding Bayes theorem basics.",
            status="open",
            mentor_comment=None,
        ),
        Doubt(
            student_id=student_id,
            topic_id=topics[1].id,
            title="Lower bound edge case",
            description="Not sure when to stop loop for binary search.",
            status="resolved",
            mentor_comment="Use while low <= high and move boundaries carefully.",
        ),
    ]
    db.add_all(doubts)


def seed_ai_logs(db, student_id: int):
    if db.query(AIUsageLog).filter(AIUsageLog.student_id == student_id).count() > 0:
        return

    logs = [
        AIUsageLog(
            student_id=student_id,
            tool_name="Cursor",
            prompt_text="Add JWT protection and role checks to backend endpoints.",
            completion_summary="Generated auth guard helpers and route protection.",
            action_taken="Reviewed and integrated with simple role checks.",
            files_impacted="backend/app/main.py, backend/app/auth.py",
            used_in_code=True,
            notes="Kept access rules assignment-friendly.",
        ),
        AIUsageLog(
            student_id=student_id,
            tool_name="Cursor",
            prompt_text="Add topic CRUD and search with minimal UI changes.",
            completion_summary="Provided PUT/DELETE/search endpoints and UI wiring.",
            action_taken="Accepted and tested with dashboard update.",
            files_impacted="backend/app/main.py, frontend/src/App.jsx, frontend/src/api.js",
            used_in_code=True,
            notes="Simplified edit form inline.",
        ),
    ]
    db.add_all(logs)


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = seed_users(db)
        student = users["student1@bits.com"]
        seed_topics_tasks_doubts(db, student.id)
        seed_ai_logs(db, student.id)
        db.commit()
        print("Lightweight DB initialized with sample data.")
        print("Login credentials:")
        print("student1@bits.com / Test@123")
        print("mentor1@bits.com / Test@123")
        print("admin1@bits.com / Test@123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
