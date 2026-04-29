import os
from datetime import date, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

load_dotenv()

MAX_HOURS_PER_DAY = int(os.getenv("MAX_HOURS_PER_DAY", "3"))


class TopicInput(BaseModel):
    topic_id: int
    deadline: date
    difficulty: int = Field(ge=1, le=5)
    unresolved_doubts: int = 0


class PriorityScoreInput(BaseModel):
    topics: list[TopicInput]


class PriorityScoreOutput(BaseModel):
    topic_id: int
    priority_score: int


class GeneratePlanInput(BaseModel):
    student_id: int
    topics: list[TopicInput]
    start_date: date | None = None


class GeneratedTask(BaseModel):
    student_id: int
    topic_id: int
    task_date: date
    hours_planned: int
    status: str
    priority_score: int


def calculate_priority(deadline: date, difficulty: int, unresolved_doubts: int = 0) -> int:
    days_left = max((deadline - date.today()).days, 0)
    urgency_score = max(0, 30 - days_left)
    difficulty_score = difficulty * 10
    doubt_score = unresolved_doubts * 15
    return urgency_score + difficulty_score + doubt_score


def build_week_dates(start_date: date | None = None) -> list[date]:
    start = start_date or date.today()
    return [start + timedelta(days=offset) for offset in range(7)]


app = FastAPI(title="AI Study Planner Service", version="1.0.0")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/priority-score", response_model=list[PriorityScoreOutput])
def priority_score(payload: PriorityScoreInput):
    return [
        PriorityScoreOutput(
            topic_id=topic.topic_id,
            priority_score=calculate_priority(topic.deadline, topic.difficulty, topic.unresolved_doubts),
        )
        for topic in payload.topics
    ]


@app.post("/generate-plan", response_model=list[GeneratedTask])
def generate_plan(payload: GeneratePlanInput):
    week_dates = build_week_dates(payload.start_date)
    by_day_hours = {day: 0 for day in week_dates}
    generated: list[GeneratedTask] = []

    scored_topics = sorted(
        payload.topics,
        key=lambda topic: calculate_priority(topic.deadline, topic.difficulty, topic.unresolved_doubts),
        reverse=True,
    )

    for topic in scored_topics:
        score = calculate_priority(topic.deadline, topic.difficulty, topic.unresolved_doubts)
        for day in week_dates:
            if by_day_hours[day] < MAX_HOURS_PER_DAY:
                generated.append(
                    GeneratedTask(
                        student_id=payload.student_id,
                        topic_id=topic.topic_id,
                        task_date=day,
                        hours_planned=1,
                        status="pending",
                        priority_score=score,
                    )
                )
                by_day_hours[day] += 1
                break

    return generated
