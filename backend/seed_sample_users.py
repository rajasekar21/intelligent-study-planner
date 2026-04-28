from app.auth import hash_password
from app.database import SessionLocal
from app.models import User


def main() -> None:
    db = SessionLocal()
    try:
        users = [
            ("Student One", "student1@bits.com", "student"),
            ("Mentor One", "mentor1@bits.com", "mentor"),
            ("Admin One", "admin1@bits.com", "admin"),
        ]
        password = "Test@123"
        created: list[str] = []
        existing: list[str] = []

        for name, email, role in users:
            row = db.query(User).filter(User.email == email).first()
            if row:
                existing.append(email)
                continue
            db.add(
                User(
                    name=name,
                    email=email,
                    password_hash=hash_password(password),
                    role=role,
                )
            )
            created.append(email)

        db.commit()
        print({"created": created, "existing": existing})
    finally:
        db.close()


if __name__ == "__main__":
    main()
