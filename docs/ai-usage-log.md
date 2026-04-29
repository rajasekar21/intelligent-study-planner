# AI Usage Log (Final)

| Date | Tool | Prompt Summary | Output Used? | Files Impacted | Manual Review / Changes |
|---|---|---|---|---|---|
| 2026-04-28 | Cursor | Add JWT token verification and role checks for protected APIs | Yes | `backend/app/main.py`, `backend/app/auth.py` | Verified route guards with `Depends(get_current_user)` and adjusted access checks for student/admin behavior. |
| 2026-04-28 | Cursor | Implement topic CRUD + search in backend and frontend | Yes | `backend/app/main.py`, `backend/app/schemas.py`, `frontend/src/App.jsx`, `frontend/src/api.js` | Simplified edit flow and validated request/response format against Swagger. |
| 2026-04-28 | Cursor | Convert auth/dashboard into route-based frontend structure | Yes | `frontend/src/App.jsx`, `frontend/src/main.jsx` | Fixed navigation edge cases (`/` redirect, login/register switching) after testing manually. |
| 2026-04-28 | Cursor | Add DB-backed AI usage log with markdown export | Yes | `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/main.py`, `frontend/src/App.jsx`, `frontend/src/api.js` | Added form fields, tested create/list/delete/export end-to-end using seeded user. |
| 2026-04-28 | Cursor | Migrate to lightweight SQLite setup and add sample-data bootstrap | Yes | `backend/app/database.py`, `backend/.env.example`, `backend/init_lightweight_db.py`, `README.md` | Fixed bcrypt compatibility issue by pinning `bcrypt==4.0.1`; re-tested login and DB initialization. |
| 2026-04-28 | Cursor | Improve UI polish and modularize frontend components/pages | Yes | `frontend/src/styles.css`, `frontend/src/components/AuthForm.jsx`, `frontend/src/pages/*`, `frontend/src/App.jsx` | Preserved existing behavior while splitting UI into reusable files for rubric compliance. |
| 2026-04-28 | Cursor | Create Playwright workflow automation and generate demo video | Partially | `frontend/scripts/create-demo-video.mjs`, `backend/app/main.py`, `frontend/demo-videos/*` | Updated CORS for port 5174 to resolve integration error; kept only final workflow video in repo. |

## Summary

- AI was used for acceleration in boilerplate, refactoring, and verification workflows.
- All accepted outputs were manually reviewed, tested, and cleaned before final commit.
- Rejected or adjusted AI outputs were primarily around over-complex solutions and selector/CORS fixes.
