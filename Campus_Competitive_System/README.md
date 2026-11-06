# CampusX — Campus Competitive Learning & Skill Benchmarking System

A medium-scope, runnable implementation of the main student/faculty workflow from the project synopsis. The React interface keeps the CampusX visual design; the backend now provides authenticated APIs for contests, participation, submissions, evaluation records, leaderboard and personal analytics.

## Implemented in this build

- JWT login and student self-registration; BCrypt password hashing.
- JWT request filter and role checks for faculty/admin contest creation.
- Contest list, details, create and join endpoints.
- Student source submission with a stored evaluation result.
- Overall leaderboard calculated from recorded scores.
- Subject-wise student analytics and submission history.
- Learning Studio with embedded public videos and locally saved lesson-completion state.
- Demo contests seeded automatically on a fresh database.
- Local H2 mode and Docker Compose PostgreSQL mode.
- Dockerfiles for frontend and backend.

## Run locally (Windows / VS Code)

Open two terminals in the project root.

### Terminal 1 — backend

```powershell
cd backend
& "C:\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```

Backend: `http://localhost:8080`

Local mode uses an in-memory H2 database. If the backend is restarted, local H2 users and records reset; create your student account again from the login screen.

### Terminal 2 — frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Run with Docker (persistent PostgreSQL)

From the project root:

```powershell
docker compose up --build
```

Open `http://localhost:5173`. The PostgreSQL data is stored in the `campusx-postgres` Docker volume. Stop the stack with `Ctrl+C`, then `docker compose down`; use `docker compose down -v` only if you intentionally want to delete the database volume.

The compose file uses demo-only local credentials. Change database credentials and `JWT_SECRET` before any public deployment.

## First-time setup and roles

1. Open the frontend and choose **Create student account**.
2. Register with a username and a password of at least 8 characters.
3. Sign in. Student accounts can browse contests, join them, submit source and see their own analytics.
4. Contest creation is restricted to `FACULTY` and `ADMIN` roles. Public self-registration always creates a `STUDENT` account to prevent users granting themselves elevated permissions.

### Promote a local demo account to Faculty

For local H2 development only, open `http://localhost:8080/h2-console` and connect with:

- JDBC URL: `jdbc:h2:mem:campusdb`
- User: `sa`
- Password: (blank)

Run this SQL after registering the account:

```sql
UPDATE users SET role = 'FACULTY' WHERE username = 'your_username';
```

Log out and sign in again so the next JWT contains the updated role.

For Docker/PostgreSQL, use:

```powershell
docker compose exec database psql -U campusx -d campusx -c "UPDATE users SET role='FACULTY' WHERE username='your_username';"
```

## Main API routes

All routes below except `/api/auth/**` require `Authorization: Bearer <JWT>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create a student account |
| POST | `/api/auth/login` | Obtain JWT and role |
| GET | `/api/contests` | List contests and current user's join state |
| GET | `/api/contests/{id}` | Contest details |
| POST | `/api/contests` | Faculty/Admin creates a contest |
| POST | `/api/contests/{id}/join` | Student joins a contest |
| POST | `/api/contests/{id}/submissions` | Submit source for demo evaluation |
| GET | `/api/submissions/mine` | Current user's submission history |
| GET | `/api/leaderboard` | Overall points leaderboard |
| GET | `/api/analytics/mine` | Current user's score and subject averages |

## Evaluation and architecture notes — important for demo/viva

This version is a **modular Spring Boot application**, not seven independently deployed microservices yet. It implements the central workflow in one backend so it remains manageable for a student project demo. PostgreSQL is available through Docker Compose; H2 is used for quick local development.

The evaluation endpoint currently applies a transparent source-structure rubric and stores the score. It deliberately does **not** execute arbitrary student code on the web server. A production online judge needs isolated containers/sandboxes, test-case management, CPU/memory/time limits, and asynchronous workers. Kafka/RabbitMQ, Redis sorted sets, STOMP/WebSocket live pushes, separate service databases, load testing and fault-tolerance are documented next-stage integrations, not claimed as implemented in this package.

Leaderboard and analytics are database-backed but fetched when the dashboard loads/refreshes; they are not push-based real-time streams. Lesson completion is browser-local. The video URLs are public educational embeds and can be replaced with faculty-approved material.

## Suggested demo sequence

1. Register/sign in as Student.
2. Open Contests → join a challenge → paste a short code sample → submit.
3. Show the returned evaluation score and submission history.
4. Open My Progress and show subject-wise score aggregation.
5. Open Leaderboard and show score aggregation across accounts.
6. Promote a second account to Faculty using the SQL above, sign in as Faculty, and publish a contest.
7. Open Learning Studio and play an embedded lesson.

## Verification status

JSX/JavaScript syntax was checked. A complete frontend production build and Maven package build could not be confirmed in this execution environment: the supplied Windows `node_modules` archive lacks Linux Rolldown native optional bindings, and Maven is not installed here. On the Windows machine, run `npm install` / `npm run build` and `mvn spring-boot:run`; resolve any environment-specific build errors before submission.
