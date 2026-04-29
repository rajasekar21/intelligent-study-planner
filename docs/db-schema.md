# Intelligent Study Planner - DB Schema

## ER Diagram

```mermaid
erDiagram
    USERS ||--o{ TOPICS : owns
    USERS ||--o{ PLANNER_TASKS : has
    USERS ||--o{ DOUBTS : raises
    USERS ||--o{ AI_LOGS : records
    TOPICS ||--o{ PLANNER_TASKS : planned_for
    TOPICS ||--o{ DOUBTS : related_to

    USERS {
        int id PK
        string name
        string email UNIQUE
        string password_hash
        string role
        datetime created_at
    }

    TOPICS {
        int id PK
        int student_id FK
        string subject
        string title
        date deadline
        int difficulty
        boolean is_completed
        datetime created_at
    }

    PLANNER_TASKS {
        int id PK
        int student_id FK
        int topic_id FK
        date task_date
        int hours_planned
        string status
        int priority_score
    }

    DOUBTS {
        int id PK
        int student_id FK
        int topic_id FK
        string title
        text description
        string status
        text mentor_comment
        datetime created_at
    }

    AI_LOGS {
        int id PK
        int student_id FK
        string tool_name
        text prompt_text
        text completion_summary
        text action_taken
        text files_impacted
        boolean used_in_code
        text notes
        datetime created_at
    }
```

## Table Details

### `users`
- **Purpose:** Stores all application users and authentication identity.
- **Columns:** `id`, `name`, `email`, `password_hash`, `role`, `created_at`
- **Notes:** `email` is unique; `role` supports `student`, `mentor`, `admin`.

### `topics`
- **Purpose:** Stores syllabus topics created by students for planning.
- **Columns:** `id`, `student_id`, `subject`, `title`, `deadline`, `difficulty`, `is_completed`, `created_at`
- **Relationships:** many topics belong to one user (`student_id -> users.id`).

### `planner_tasks` (implemented as `study_tasks` table in code)
- **Purpose:** Stores generated daily/weekly study tasks and progress status.
- **Columns:** `id`, `student_id`, `topic_id`, `task_date`, `hours_planned`, `status`, `priority_score`
- **Relationships:** linked to both user and topic.

### `doubts`
- **Purpose:** Stores student doubts and mentor/admin review updates.
- **Columns:** `id`, `student_id`, `topic_id`, `title`, `description`, `status`, `mentor_comment`, `created_at`
- **Relationships:** doubt belongs to a user; optional relation to a topic.

### `ai_logs` (implemented as `ai_usage_logs` table in code)
- **Purpose:** Stores AI tool usage evidence for assignment reflection and export.
- **Columns:** `id`, `student_id`, `tool_name`, `prompt_text`, `completion_summary`, `action_taken`, `files_impacted`, `used_in_code`, `notes`, `created_at`
- **Relationships:** each log belongs to a user.

## Stack Alignment Notes

- ORM: SQLAlchemy models in backend map to these tables.
- Database: SQLite (`backend/study_planner.db`).
- Auth context: JWT token identifies user, and most records are filtered by `student_id`.
