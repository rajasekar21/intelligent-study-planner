from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role: str = Field(default="student")


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TopicCreate(BaseModel):
    subject: str
    title: str
    deadline: date
    difficulty: int = Field(default=3, ge=1, le=5)


class TopicOut(BaseModel):
    id: int
    student_id: int
    subject: str
    title: str
    deadline: date
    difficulty: int
    is_completed: bool

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: int
    student_id: int
    topic_id: int
    task_date: date
    hours_planned: int
    status: str
    priority_score: int

    class Config:
        from_attributes = True


class TaskStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|completed|missed)$")


class DoubtCreate(BaseModel):
    topic_id: Optional[int] = None
    title: str
    description: str


class DoubtUpdate(BaseModel):
    status: str = Field(pattern="^(open|in_review|resolved)$")
    mentor_comment: Optional[str] = None


class DoubtOut(BaseModel):
    id: int
    student_id: int
    topic_id: Optional[int]
    title: str
    description: str
    status: str
    mentor_comment: Optional[str]

    class Config:
        from_attributes = True
