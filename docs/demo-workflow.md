# Demo Workflow Guide

Use this guide to record the complete demo video without running into page-by-page surprises.

## 1) Start the Demo Environment

From the project root in GitHub Codespaces:

```bash
git pull
./scripts/stop-demo.sh
rm -f .demo-services.pids
./scripts/start-demo.sh
```

Wait until the terminal shows all three health checks:

```text
OK: AI service is running at http://127.0.0.1:8001/health
OK: Backend service is running at http://127.0.0.1:8000/health
OK: Frontend UI is running at http://127.0.0.1:5174
```

Open the forwarded URL for port `5174`. Use the browser URL provided by Codespaces, not `127.0.0.1`, when recording from your local browser.

## 2) Quick Pre-demo Checks

Run these in the Codespaces terminal before recording:

```bash
curl -fsS http://127.0.0.1:8001/health
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:5174
```

Expected health response for AI and backend:

```json
{"status":"ok"}
```

If a check fails, inspect logs:

```bash
cat .demo-logs/ai-service.log
cat .demo-logs/backend.log
cat .demo-logs/frontend.log
```

## 3) Recommended Demo User

For the smoothest demo, use the seeded student account:

```text
Email: student1@bits.com
Password: Test@123
```

The React UI is focused on the student workflow. Mentor/admin users exist in the backend sample data, but the current frontend dashboard is not a separate mentor/admin dashboard.

## 4) Video Flow: All Pages and Sections

### Page 1: Login

1. Open the forwarded frontend URL for port `5174`.
2. Show the Login page.
3. Enter:
   - Email: `student1@bits.com`
   - Password: `Test@123`
4. Click `Login`.
5. You should land on the Dashboard page.

### Page 2: Register

Use this section to show that new users can be created. Do this after showing login, or open it in a fresh/incognito tab.

1. Click `Logout` if you are already on the dashboard.
2. On the Login page, click `New user? Go to Register`.
3. Enter a unique demo user:
   - Name: `Demo Student`
   - Role: `student`
   - Email: `demo.student.<number>@bits.com`
   - Password: `Test@123`
4. Click `Register`.
5. The app redirects to Login.
6. For the rest of the demo, login again with `student1@bits.com` / `Test@123` so seeded topics, tasks, doubts, and AI logs are already available.

### Page 3: Dashboard Overview

1. Show the logged-in card: `Student One (student)`.
2. Show the metrics cards:
   - Completion Rate
   - Missed Tasks
   - Open Doubts
   - Risk Level
3. Explain that these values come from the backend insights endpoint.

### Dashboard Section: Add Syllabus Topic

1. In `Add Syllabus Topic`, enter:
   - Subject: `Operating Systems`
   - Topic: `Process Scheduling`
   - Deadline: `2026-05-10`
   - Difficulty: `4`
2. Click `Add Topic`.
3. Confirm the new topic appears in the `Topics` list.

Use future deadlines during recording. Past dates still work, but future dates make the planning logic easier to explain.

### Dashboard Section: Topic Search, Edit, and Delete

1. In the `Topics` search box, type `Operating`.
2. Confirm only the new Operating Systems topic is shown.
3. Clear the search box.
4. Click `Edit` on the new topic.
5. Change difficulty from `4` to `5`.
6. Click `Save`.
7. Do not delete this topic yet if you want it included in AI plan generation.
8. Later, near the end of the recording, click `Delete` on a demo-only topic to show delete behavior.

### Dashboard Section: Raise Doubt

1. In `Raise Doubt`, choose a topic from the dropdown, for example `Operating Systems - Process Scheduling`.
2. Enter:
   - Title: `Round robin time quantum doubt`
   - Description: `Need help understanding how time quantum affects waiting time.`
3. Click `Submit Doubt`.
4. Confirm it appears in the `Doubts` section with status `open`.

### Dashboard Section: Generate AI Weekly Plan

1. Click `Generate AI Weekly Plan` at the top of the dashboard.
2. Confirm the browser prompt.
3. Wait for the `Weekly Tasks` section to refresh.
4. Show generated tasks with:
   - Task id
   - Topic id
   - Task date
   - Status
5. Click `Complete` on one pending task.
6. Click `Missed` on another pending task.
7. Show that the Performance Insights numbers update.

### Dashboard Section: Performance Insights

1. Point to `Completion Rate`.
2. Point to `Missed Tasks`.
3. Point to `Open Doubts`.
4. Point to `Risk Level`.
5. Explain that this is calculated from task and doubt data.

### Dashboard Section: AI Usage Log

1. In `AI Usage Log (DB)`, enter:
   - Tool Name: `Cursor`
   - Prompt Used: `Generate a FastAPI endpoint for weekly study planning.`
   - Completion Summary: `Suggested endpoint logic and response format.`
   - Action Taken: `Reviewed, adjusted, and integrated into backend planning flow.`
   - Files Impacted: `backend/app/main.py, ai-service/main.py`
   - Keep `AI output used in final code` checked.
   - Notes: `Used as assistance, then manually tested.`
2. Click `Save AI Log`.
3. Confirm the saved log appears in `Saved AI Logs`.
4. Click `Generate Markdown Export`.
5. Show the Markdown preview.
6. Click `Copy Export` if clipboard permission is available.

### Dashboard Section: Logout

1. Click `Logout`.
2. Confirm the app returns to the Login page.
3. This completes all visible pages: Login, Register, Dashboard, and all dashboard sections.

## 5) Suggested Video Narration Order

Use this order for a clean 4-6 minute video:

1. Project purpose and tech stack.
2. Start services in Codespaces and show health checks.
3. Login with seeded student account.
4. Show dashboard metrics.
5. Add and search a topic.
6. Raise a doubt.
7. Generate AI weekly plan.
8. Mark tasks completed/missed.
9. Show insights changing.
10. Add AI usage log and export Markdown.
11. Logout.
12. Mention logs and one-command stop script.

## 6) Stop the Demo

After recording:

```bash
./scripts/stop-demo.sh
```

If any process remains, rerun the stop script or close the Codespace.
