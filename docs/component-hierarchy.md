# Frontend Component Hierarchy

This document lists the current React component hierarchy for the assignment UI.

## Route tree

- `App`
  - `/` -> redirect to `/login` or `/dashboard`
  - `/login` -> `LoginPage`
    - `AuthForm` (`mode="login"`)
  - `/register` -> `RegisterPage`
    - `AuthForm` (`mode="register"`)
  - `/dashboard` -> `DashboardPage`
    - Dashboard header/actions section
    - Insights metric cards section
    - Add topic form section
    - Raise doubt form section
    - Topics list + edit/delete section
    - Weekly tasks section
    - Doubts list section
    - Performance insights summary section
    - AI usage log create form section
    - AI usage log list/export section

## File mapping

- `frontend/src/App.jsx` -> app state, route guards, and handlers
- `frontend/src/pages/LoginPage.jsx` -> login page wrapper
- `frontend/src/pages/RegisterPage.jsx` -> register page wrapper
- `frontend/src/components/AuthForm.jsx` -> reusable auth form UI
- `frontend/src/pages/DashboardPage.jsx` -> dashboard presentation UI
