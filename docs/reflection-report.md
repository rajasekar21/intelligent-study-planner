# Reflection Report

## 1) AI Tool Used and Workflow

I used Cursor AI as the primary assistant during development. The workflow was iterative: define a focused task, generate a first pass, validate the output in the running app/API, then manually refine and commit. This approach was used for backend features, frontend refactoring, documentation, and demo automation.

## 2) Representative Prompts Used

- "Add JWT verification and role checks for protected routes."
- "Keep it simple, add full topic CRUD and search end-to-end."
- "Refactor frontend into route-based pages and modular components."
- "Generate Playwright script for end-to-end workflow video."
- "Migrate from PostgreSQL footprint to lightweight SQLite setup."

## 3) AI-Generated vs Manual Work

### AI-assisted contributions

- Drafted route protection and token decoding integration.
- Generated API and UI wiring for topic CRUD and AI usage logs.
- Helped create initial docs structure (`api.md`, `architecture.md`, reflection/log drafts).
- Proposed UI improvements and modularization into `pages/` + `components/`.
- Generated Playwright automation script for workflow recording.

### Manual contributions

- Validated rubric compliance and prioritized required fixes.
- Corrected role-access boundaries and endpoint behavior.
- Resolved integration bug where frontend on port `5174` failed due to backend CORS allowlist mismatch.
- Fixed dependency compatibility (`passlib` + `bcrypt`) while initializing lightweight DB.
- Cleaned repository history/artifacts (kept only final workflow video, updated `.gitignore`).
- Reviewed and edited docs to remove outdated statements (for example, JWT middleware TODO after it was implemented).

## 4) How AI Helped and Where It Did Not

AI helped significantly in reducing implementation time for repetitive coding tasks and refactor scaffolding. It was especially useful for generating consistent endpoint wiring and UI boilerplate.

However, AI output was not always correct in context. Some responses reflected generic assumptions (for example, stale documentation wording or brittle selector assumptions in browser automation). These required manual debugging and domain-specific corrections.

## 5) Key Integration/Debugging Issues Encountered

1. **CORS failure during login in automated browser flow**  
   Frontend was running at `localhost:5174`, but backend CORS allowed only `5173`.  
   Fix: expanded `allow_origins` list in FastAPI middleware.

2. **SQLite bootstrap failed due to bcrypt/passlib mismatch**  
   Error occurred while hashing seeded user passwords.  
   Fix: pinned `bcrypt==4.0.1` in backend requirements.

3. **Initial Playwright selectors were unstable**  
   Some label-based selectors timed out due to page/form structure.  
   Fix: revised script to stable scoped selectors and added better fallback checks.

4. **Repository noise from generated artifacts**  
   Multiple temporary videos and local DB file created clutter.  
   Fix: ignored runtime artifacts and retained only required workflow video in remote.

## 6) Learning Outcomes

- Better understanding of secure API layering in FastAPI (JWT decode + role checks + route dependencies).
- Practical understanding of frontend/backend integration pitfalls (especially CORS and environment/port mismatches).
- Improved confidence in refactoring a single-file React UI into modular route/page/component structure.
- Better judgment in using AI as an accelerator while preserving correctness through manual review.

## 7) Final Reflection

AI improved delivery speed and enabled rapid iteration, but correctness still depended on manual reasoning, testing, and cleanup. The most valuable learning came from debugging AI-generated code, not just accepting it. Overall, AI helped productivity while still requiring strong developer ownership of quality and final decisions.
