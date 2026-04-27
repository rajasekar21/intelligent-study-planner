# Intelligent Study Planner and Doubt Tracker

Full-stack assignment project using:
- React (frontend)
- Python FastAPI (backend)
- PostgreSQL (database)

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
- Database: PostgreSQL
- Auth: simple JWT token generation

## 4) Prerequisites

Install the following on your machine:
- Node.js (includes `npm`) version 18+
- Python 3.10+
- PostgreSQL 14+

## 5) Database Setup

1. Create database:
   ```sql
   CREATE DATABASE study_planner_db;
   ```
2. Run schema from `database/schema.sql` in PostgreSQL.

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

## 8) API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Topics
- `POST /topics?student_id={id}`
- `GET /topics?student_id={id}`

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
  - architecture diagram
  - AI usage log
  - demo video
  - reflection report
