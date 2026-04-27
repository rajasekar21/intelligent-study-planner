from datetime import date, timedelta


def calculate_priority(deadline: date, difficulty: int, unresolved_doubts: int = 0) -> int:
    days_left = max((deadline - date.today()).days, 0)
    urgency_score = max(0, 30 - days_left)
    difficulty_score = difficulty * 10
    doubt_score = unresolved_doubts * 15
    return urgency_score + difficulty_score + doubt_score


def build_week_dates(start_date: date | None = None) -> list[date]:
    start = start_date or date.today()
    return [start + timedelta(days=offset) for offset in range(7)]
