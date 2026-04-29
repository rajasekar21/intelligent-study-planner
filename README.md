# Intelligent Study Planner and Doubt Tracker

Full-stack assignment project using:
- React (frontend)
- Python FastAPI (backend)
- SQLite (lightweight default)

This AI-powered study planner helps students plan syllabus coverage, generate adaptive weekly plans, track progress, raise doubts, and view performance insights.

## 1) Project Structure

```
intelligent-study-planner/
├── ai-service/
│   ├── .env.example
│   ├── main.py
│   └── requirements.txt
├── backend/
│   ├── app/
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
- AI-assisted weekly study task generation (via dedicated AI microservice)
- AI-powered priority scoring using deadlines, difficulty, and unresolved doubts
- Task status updates (`pending`, `completed`, `missed`)
- Doubt creation and tracking
- Student performance insights and risk level

## 3) Tech Stack

- Frontend: React 18 + Vite
- Backend: FastAPI + SQLAlchemy
- AI Service: FastAPI microservice (port 8001)
- Database: SQLite
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

## 6) AI Service Setup (FastAPI, Port 8001)

From project root:

```bash
cd ai-service
python -m venv .venv
```

Activate venv and run:

```bash
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
uvicorn main:app --reload --port 8001
```

AI service URL: `http://127.0.0.1:8001`

Endpoints:
- `POST /generate-plan`
- `POST /priority-score`
- `GET /health`

## 7) Backend Setup (FastAPI, Port 8000)

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

Note: backend expects AI service at `AI_SERVICE_URL` (default `http://127.0.0.1:8001`).

## 8) Frontend Setup (React + Vite)

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

## Demo Video

- Google Drive demo link: [Workflow Demo Video](https://drive.google.com/drive/folders/1t1qviVVjGLx9-FJE6J2N_Hpt7qelSrKm?usp=sharing)
- Suggested flow covered in demo:
  - Login/Register
  - Topic CRUD and search
  - AI weekly planner generation and task status update
  - Doubt submission and tracking
  - Insights dashboard
  - AI usage log creation and markdown export

## 9) API Endpoints

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

## 10) AI Logic Included

In `ai-service/main.py`, planner logic computes priority score using:
- deadline urgency
- topic difficulty
- unresolved doubts

Weekly schedule generation allocates topic tasks across 7 days with max daily load.

## 11) Suggested Next Improvements

- Stronger refresh-token and session management
- Separate mentor/admin dashboards and route guards
- Better planning algorithm using study-hour preferences and exam calendar
- Unit tests and integration tests

## 12) Assignment Deliverable Mapping

- Backend APIs + validation + docs: implemented
- Frontend UI + interactivity: implemented
- Integration: implemented
- AI-assisted module: implemented (`ai.py`)
- Ready for:
  - architecture diagram (`docs/architecture.md`)
  - AI usage log (`docs/ai-usage-log.md`)
  - reflection report (`docs/reflection-report.md`)
  - API documentation notes (`docs/api.md`)

## 13) Role and Security Scope (Simple Version)

- JWT-based token verification added to protected APIs.
- Student can access only own data.
- Mentor/Admin can update doubt review status.
- Admin can access any student data.
- This project intentionally keeps security simple for assignment scope.

## 14) Contributors and AI Assistance

- Primary developer: `rajasekar21`
- AI development assistant: Cursor AI (used for code generation, refactoring, debugging support, and documentation drafting)
- All AI-assisted output was manually reviewed, tested, and integrated before final use.
