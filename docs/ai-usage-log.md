# AI Usage Log – Intelligent Study Planner

## 1) Summary of AI tool used and how

For this project I used **Cursor AI** as my main AI coding assistant. I did not use it as a one-click code generator. My workflow was more like: I first understood what feature I needed, asked Cursor for a draft implementation, then manually reviewed and corrected it.

I used Cursor mostly for:
- creating boilerplate faster (API endpoints, schemas, frontend wiring)
- debugging integration issues between frontend and backend
- improving code structure (especially frontend modularization)
- generating docs drafts that I later rewrote in my own words

My stack in this project is:
- Frontend: **React 18 + Vite**
- Backend: **Python FastAPI**
- Database: **SQLite**
- Auth: **JWT-based login/route protection**

In many places Cursor gave me a good starting point, but I still had to do real debugging and decision-making. So I treat Cursor as a coding accelerator, not a replacement for understanding.

## 2) Example prompts, generated output, and manual changes

| # | Example Prompt I Used | What Cursor Generated | What I Manually Changed |
|---|---|---|---|
| 1 | "Add JWT auth middleware and protect all private routes." | Token decode helper + route dependency usage. | Verified each endpoint one by one and corrected role checks for student/admin access. |
| 2 | "Add full topic CRUD with search in FastAPI and React." | `POST/GET/PUT/DELETE` topic APIs and frontend API calls. | Simplified UI edit flow and fixed request payload mapping for date/difficulty fields. |
| 3 | "Refactor frontend into route-based pages." | Basic route split for login/register/dashboard. | Reworked redirects and auth navigation so existing users can directly login without confusion. |
| 4 | "Improve UI styling but keep it simple." | Modern card-based CSS and layout suggestions. | Reduced oversized auth form spacing, adjusted button hierarchy, and tuned readability manually. |
| 5 | "Add AI usage log in DB with endpoints and UI form." | Model, schema, endpoints, and frontend form/list. | Added better field naming, improved UX text, and validated that logs persist and export correctly. |
| 6 | "Export AI logs as markdown for report submission." | Backend export endpoint and frontend preview/copy flow. | Fixed edge formatting in exported markdown table and tested copy workflow manually. |
| 7 | "Create Playwright script for end-to-end demo recording." | Initial automation script with selectors and flow steps. | Replaced brittle selectors, handled login flow issues, and fixed CORS port mismatch. |
| 8 | "Convert backend AI logic into standalone microservice." | Separate FastAPI service structure and endpoint idea. | Completed service split, wired backend `httpx` calls, updated env config, and updated README run steps. |
| 9 | "Make assignment docs complete and rubric-friendly." | Initial markdown templates for API/architecture/reflection. | Rewrote content with project-specific details, removed placeholder-style text, and fixed outdated notes. |
| 10 | "Clean repo history and keep only required artifacts." | Suggested cleanup steps. | Manually deleted extra videos, updated `.gitignore`, and kept only final workflow demo. |

## 3) AI-generated vs manually written parts

### Mostly AI-assisted (then reviewed)
- Initial drafts of backend endpoint structure and schema updates
- Frontend API client additions and repetitive UI wiring
- First versions of documentation files
- Initial Playwright recording script

### Mostly manual by me
- Final auth/role enforcement decisions
- Debug fixes after real runtime errors
- CORS configuration decisions for multiple local ports
- Refactor decisions for frontend modularization (`pages/` + `components/`)
- Repo cleanup choices (what to commit, what to ignore)
- Final wording for reflection and submission-facing docs

In short, Cursor helped me write faster, but final correctness and submission quality were achieved through manual validation.

## 4) Issues encountered integrating AI output

The biggest issues I hit were practical integration problems, not syntax problems:

1. **CORS mismatch issue**  
   Frontend was running on a fallback port (`5174`) but backend CORS allowed only `5173`. This caused login `Failed to fetch` errors. I fixed it by updating allowed origins in FastAPI.

2. **Dependency mismatch in password hashing**  
   During sample-user setup, bcrypt/passlib compatibility caused hashing failures. I fixed it by pinning compatible versions and retesting login.

3. **Automation script fragility**  
   The first Playwright script failed due to label selector assumptions and route timing. I replaced selectors with more stable scoped locators and added fallback logic.

4. **Docs drift vs code reality**  
   One README note said JWT middleware was still pending even after implementation. I manually corrected docs to match actual code state.

5. **Over-generation / extra artifacts**  
   AI-assisted automation produced multiple temporary videos. I cleaned them and kept only the final workflow video in remote.

## 5) What I learned from debugging AI-generated code

This was the most valuable part of using AI.

- I learned to **never trust first output blindly**, even when it looks clean.
- I got better at **end-to-end verification** (API test + frontend behavior + docs consistency).
- I understood FastAPI auth flow more clearly: token creation, dependency injection, and role checks.
- I learned practical frontend-backend integration details like CORS, env-based base URLs, and route guards.
- I improved my ability to ask better prompts: specific constraints like "keep it minimal", "do not overengineer", and "preserve existing behavior" gave better results.

My final takeaway: Cursor AI genuinely improved speed and helped with repetitive work, but my learning came from debugging and refining AI output. That manual step is what turned generated code into a working, submission-ready project.
