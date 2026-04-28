# Intelligent Study Planner and Doubt Tracker

Full-stack assignment project using:
- React (frontend)
- Python FastAPI (backend)
- SQLite (lightweight default) / PostgreSQL (optional)

This application helps students plan syllabus coverage, generate an adaptive weekly plan, track progress, raise doubts, and view performance insights.

## 1) Project Structure

```
intelligent-study-planner/
├── backend/
│   ├── app/
│   │   ├── ai.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql
```

## 2) Features Implemented

- Role-based user registration/login (`student`, `mentor`, `admin`)
- Topic and syllabus deadline management
- AI-assisted weekly study task generation
- Task status updates (`pending`, `completed`, `missed`)
- Doubt creation and tracking
- Student performance insights and risk level

## 3) Tech Stack

- Frontend: React 18 + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite (default), PostgreSQL optional
- Auth: simple JWT token generation

## 4) Prerequisites

Install the following on your machine:
- Node.js (includes `npm`) version 18+
- Python 3.10+

## 5) Database Setup

### Lightweight default (recommended)

From `backend` run:

```bash
python init_lightweight_db.py
```

This creates `backend/study_planner.db` and imports sample data.

Sample login credentials:
- `student1@bits.com` / `Test@123`
- `mentor1@bits.com` / `Test@123`
- `admin1@bits.com` / `Test@123`

### Optional PostgreSQL setup

- Set `DATABASE_URL` in backend `.env`
- Run schema from `database/schema.sql`

## 6) Backend Setup (FastAPI)

From project root:

```bash
cd backend
python -m venv .venv
```

Activate venv:

- Windows (PowerShell):
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- macOS/Linux:
  ```bash
  source .venv/bin/activate
  ```

Install dependencies and run:

```bash
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

Health check: `GET /health`

Swagger docs: `http://127.0.0.1:8000/docs`

## 7) Frontend Setup (React + Vite)

From project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

Frontend environment:

```bash
# frontend/.env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 8) API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Topics
- `POST /topics?student_id={id}`
- `GET /topics?student_id={id}`
- `GET /topics?student_id={id}&search={text}`
- `PUT /topics/{topic_id}`
- `DELETE /topics/{topic_id}`

### Planner
- `POST /planner/generate?student_id={id}`
- `GET /planner/week?student_id={id}`
- `PATCH /planner/task/{task_id}`

### Doubts
- `POST /doubts?student_id={id}`
- `GET /doubts?student_id={id}`
- `PATCH /doubts/{doubt_id}`

### Insights
- `GET /insights/student/{student_id}`

### AI Usage Logs (DB)
- `POST /ai-logs?student_id={id}`
- `GET /ai-logs?student_id={id}`
- `DELETE /ai-logs/{log_id}`
- `GET /ai-logs/export?student_id={id}` (markdown export for report)

All protected endpoints require:
- `Authorization: Bearer <access_token>`

## 9) AI Logic Included

In `backend/app/ai.py`, planner logic computes priority score using:
- deadline urgency
- topic difficulty
- unresolved doubts

Weekly schedule generation allocates topic tasks across 7 days with max daily load.

## 10) Suggested Next Improvements

- Proper JWT auth middleware for protected routes
- Separate mentor/admin dashboards and route guards
- AI service as standalone microservice
- Better planning algorithm using study-hour preferences and exam calendar
- Unit tests and integration tests

## 11) Assignment Deliverable Mapping

- Backend APIs + validation + docs: implemented
- Frontend UI + interactivity: implemented
- Integration: implemented
- AI-assisted module: implemented (`ai.py`)
- Ready for:
  - architecture diagram (`docs/architecture.md`)
  - AI usage log (`docs/ai-usage-log.md`)
  - reflection report (`docs/reflection-report.md`)
  - API documentation notes (`docs/api.md`)

## 12) Role and Security Scope (Simple Version)

- JWT-based token verification added to protected APIs.
- Student can access only own data.
- Mentor/Admin can update doubt review status.
- Admin can access any student data.
- This project intentionally keeps security simple for assignment scope.
