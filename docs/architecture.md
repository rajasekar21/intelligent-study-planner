# Architecture (Simple Full-Stack)

## Overview

This project uses a simple 3-layer architecture:

1. React frontend (`frontend`)
2. FastAPI backend (`backend`)
3. PostgreSQL database (`database`)

## Component Flow

- User interacts with React UI (login/register/dashboard routes).
- Frontend calls backend REST APIs using `fetch`.
- Backend validates input using Pydantic schemas.
- Backend applies role checks and token verification.
- SQLAlchemy persists and reads data from PostgreSQL.

## Service Boundary

- Current backend is a single service for simplicity.
- AI planner logic is kept in `backend/app/ai.py` as an internal module.
- For future microservice extension, planner logic can be moved to a standalone service.

## Suggested Diagram (for LMS submission)

Draw a simple block diagram with:
- React App -> FastAPI API -> PostgreSQL
- Add JWT label between React and FastAPI
- Add modules in FastAPI: Auth, Topics, Planner, Doubts, Insights
