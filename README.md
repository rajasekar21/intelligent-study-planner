# AI Powered Study Planner

## Demo Video

- [Watch Demo](https://drive.google.com/drive/folders/1t1qviVVjGLx9-FJE6J2N_Hpt7qelSrKm?usp=sharing)
- [Demo Workflow Guide](docs/demo-workflow.md)


## Documentation

- [Architecture](docs/architecture.md)
- [API Docs](docs/api.md)
- [DB Schema](docs/db-schema.md)
- [Component Hierarchy](docs/component-hierarchy.md)
- [AI Usage Log](docs/ai-usage-log.md)
- [Reflection Report](docs/reflection-report.md)

Full-stack assignment project using:
- React (frontend)
- Python FastAPI (backend)
- Python FastAPI AI microservice
- SQLite (lightweight default)

This AI-powered study planner helps students plan syllabus coverage, generate adaptive weekly plans, track progress, raise doubts, and view performance insights.

## 1) Project Structure

```text
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
│   ├── init_lightweight_db.py
│   ├── requirements.txt
│   └── seed_sample_users.py
├── database/
│   └── schema.sql
├── docs/
├── frontend/
│   ├── demo-videos/
│   ├── scripts/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── scripts/
    ├── start-demo.sh
    └── stop-demo.sh
```

## 2) Features Implemented

- Role-based user registration/login (`student`, `mentor`, `admin`)
- Topic and syllabus deadline management
- AI-assisted weekly study task generation through a dedicated AI microservice
- AI-powered priority scoring using deadlines, difficulty, and unresolved doubts
- Task status updates (`pending`, `completed`, `missed`)
- Doubt creation and tracking
- Student performance insights and risk level

## 3) Tech Stack

- Frontend: React 18 + Vite
- Backend: FastAPI + SQLAlchemy
- AI Service: FastAPI microservice (port `8001`)
- Database: SQLite
- Auth: simple JWT token generation

## 4) Prerequisites

Install the following on your machine or use GitHub Codespaces:
- Node.js 18+ with `npm`
- Python 3.10+
- Bash-compatible shell for the demo scripts

## 5) One-command Demo Startup

From the project root, start the AI service, backend API, and frontend UI together:

```bash
./scripts/start-demo.sh
```

To stop everything started by the script:

```bash
./scripts/stop-demo.sh
```

The scripts also work if launched with `sh`, because they re-run themselves with Bash when needed:

```bash
sh scripts/start-demo.sh
sh scripts/stop-demo.sh
```

The startup script will:
- create Python virtual environments if missing
- install Python and frontend dependencies
- initialize the lightweight SQLite database
- start all services in the background
- write logs to `.demo-logs/`
- track process IDs in `.demo-services.pids`

Default local service URLs:
- AI service: `http://127.0.0.1:8001`
- Backend API: `http://127.0.0.1:8000`
- Frontend UI: `http://localhost:5174`

Sample login credentials:
- `student1@bits.com` / `Test@123`
- `mentor1@bits.com` / `Test@123`
- `admin1@bits.com` / `Test@123`

For a full recording sequence, follow [docs/demo-workflow.md](docs/demo-workflow.md).

## 5A) GitHub Codespaces

The demo script is Codespaces-aware. It binds services to `0.0.0.0` so forwarded ports can work, while internal health checks still use `127.0.0.1` from inside the Codespace.

When running in Codespaces, use:

```bash
git pull
./scripts/stop-demo.sh
rm -f .demo-services.pids
./scripts/start-demo.sh
```

Open the forwarded frontend URL for port `5174`. The frontend uses same-origin API requests in Codespaces, and Vite proxies those requests to the backend on port `8000` inside the Codespace. This avoids browser-side calls to `127.0.0.1`, which would otherwise point to your own laptop instead of the Codespace.

If GitHub prompts you to open or make ports public, forward these ports:
- `5174` for the frontend
- `8000` for the backend API
- `8001` for the AI service

## 5B) Troubleshooting Demo Startup

If a script says a service did not become healthy, check the logs:

```bash
cat .demo-logs/ai-service.log
cat .demo-logs/backend.log
cat .demo-logs/frontend.log
```

The startup script also prints the last lines of the relevant log when a health check fails.

If a previous run stopped halfway, clean the PID file and try again:

```bash
./scripts/stop-demo.sh
rm -f .demo-services.pids
./scripts/start-demo.sh
```

If a port is already in use, either stop the old process or override the port:

```bash
AI_PORT=8011 BACKEND_PORT=8010 FRONTEND_PORT=5175 ./scripts/start-demo.sh
```

## 6) Database Setup

The one-command demo initializes the database automatically. To initialize it manually, run from `backend`:

```bash
python init_lightweight_db.py
```

This creates `backend/study_planner.db` and imports sample data.

## 7) AI Service Setup (FastAPI, Port 8001)

From project root:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

AI service URL: `http://127.0.0.1:8001`

Endpoints:
- `POST /generate-plan`
- `POST /priority-score`
- `GET /health`

## 8) Backend Setup (FastAPI, Port 8000)

From project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python init_lightweight_db.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URL: `http://127.0.0.1:8000`

Health check: `GET /health`

Swagger docs: `http://127.0.0.1:8000/docs`

Note: backend expects the AI service at `AI_SERVICE_URL` and defaults to `http://127.0.0.1:8001`.

## 9) Frontend Setup (React + Vite)

From project root:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5174
```

Frontend URL: `http://localhost:5174`

Frontend API behavior:
- Locally, the frontend defaults to `http://127.0.0.1:8000`.
- In GitHub Codespaces, the frontend uses relative API paths and Vite proxies them to the backend.
- Leave `VITE_API_BASE_URL` empty unless the backend is hosted at a separate public URL.

Example `frontend/.env`:

```bash
VITE_API_BASE_URL=
```

## 10) API Endpoints

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

## 11) AI Logic Included

In `ai-service/main.py`, planner logic computes priority score using:
- deadline urgency
- topic difficulty
- unresolved doubts

Weekly schedule generation allocates topic tasks across 7 days with max daily load.

## 12) Suggested Next Improvements

- Stronger refresh-token and session management
- Separate mentor/admin dashboards and route guards
- Better planning algorithm using study-hour preferences and exam calendar
- Unit tests and integration tests

## 13) Assignment Deliverable Mapping

- Backend APIs + validation + docs: implemented
- Frontend UI + interactivity: implemented
- Integration: implemented
- AI-assisted module: implemented (`ai-service/main.py`)
- Ready for:
  - architecture diagram (`docs/architecture.md`)
  - database schema (`docs/db-schema.md`)
  - AI usage log (`docs/ai-usage-log.md`)
  - reflection report (`docs/reflection-report.md`)
  - API documentation notes (`docs/api.md`)

## 14) Role and Security Scope (Simple Version)

- JWT-based token verification added to protected APIs.
- Student can access only own data.
- Mentor/Admin can update doubt review status.
- Admin can access any student data.
- Public routes intentionally limited to `POST /auth/register`, `POST /auth/login`, and `GET /health`.
- This project intentionally keeps security simple for assignment scope.

## 15) Contributors and AI Assistance

- Primary developer: `rajasekar21`
- AI development assistant: Cursor AI (used for code generation, refactoring, debugging support, and documentation drafting)
- All AI-assisted output was manually reviewed, tested, and integrated before final use.

## Assignment Deliverables

- [ ] GitHub repo (public)
- [ ] Demo video (Google Drive) with permission set to "Anyone at BITS with the link can view"
- [ ] Demo video link added in both `README.md` and LMS submission
- [ ] API docs
- [ ] DB schema
- [ ] Architecture diagram
- [ ] Component hierarchy (`docs/component-hierarchy.md`)
- [ ] AI usage log
- [ ] Reflection report (written in my own words)
