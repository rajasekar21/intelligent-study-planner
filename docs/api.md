# API Notes

Base URL: `http://127.0.0.1:8000`

Swagger UI: `http://127.0.0.1:8000/docs`

## Authentication

### Register
- `POST /auth/register`

### Login
- `POST /auth/login`
- Returns `access_token`, `token_type`, and `user`.

Use returned token for protected APIs:

`Authorization: Bearer <token>`

## Topics

- `POST /topics?student_id={id}`
- `GET /topics?student_id={id}`
- `GET /topics?student_id={id}&search={text}`
- `PUT /topics/{topic_id}`
- `DELETE /topics/{topic_id}`

## Planner

- `POST /planner/generate?student_id={id}`
- `GET /planner/week?student_id={id}`
- `PATCH /planner/task/{task_id}`

## Doubts

- `POST /doubts?student_id={id}`
- `GET /doubts?student_id={id}`
- `PATCH /doubts/{doubt_id}` (mentor/admin)

## Insights

- `GET /insights/student/{student_id}`

## AI Usage Logs (DB)

- `POST /ai-logs?student_id={id}`
- `GET /ai-logs?student_id={id}`
- `DELETE /ai-logs/{log_id}`
