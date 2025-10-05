# Yakkaw Dashboard — AGENTS.md

Scope: This file applies to the entire repository. It guides AI agents (Codex CLI) on how to work within this codebase safely and effectively.

## Project Overview
- Monorepo with a Go backend (Echo + GORM + PostgreSQL) and a Next.js (TypeScript) frontend.
- Backend exposes REST endpoints, handles JWT auth via cookie, and auto-migrates DB schemas on start.
- Frontend uses Next.js App Router, Tailwind, shadcn/ui, and calls the backend on `http://localhost:8080` in development.

## Repository Structure
- `backend/`
  - `main.go` — Echo server setup, CORS, background data fetch loop, routes init.
  - `routes/` — All route registrations live in `routes.go`.
  - `controllers/` — HTTP handlers. Keep business logic light here.
  - `services/` — Business logic and data ops.
  - `models/` — GORM models for persisted entities.
  - `database/` — GORM initialization via env; runs AutoMigrate on start.
  - `middlewares/` — Custom middleware (JWT, caching stubs, etc.).
  - `utils/` — Logger configuration (logrus).
  - `cache/` — Redis client (not fully wired by default).
  - `Dockerfile`, `docker-compose.yml` — Dev/deploy helpers.
- `frontend/`
  - `src/app/` — App Router pages and layout; authenticated routes (middleware guarded) like `/dashboard`.
  - `src/components/ui/` — Reusable UI components (shadcn/ui style).
  - `src/hooks/` — Data-fetching and UI state hooks per domain (devices, news, etc.).
  - `src/constant/` — Static demo data structures used in UI.
  - `utils/` — Axios instance (`api.ts`), auth helpers (`auth.ts`).

## How to Run (Development)
Prereqs: Go, Node (or Bun), PostgreSQL, and a `.env` for backend.

1) Database
- Create a PostgreSQL database and user locally (or use Docker Compose below).

2) Backend
- Env file (create at `backend/.env`):
  - `DB_HOST=localhost`
  - `DB_PORT=5432`
  - `DB_USER=your_user`
  - `DB_PASSWORD=your_password`
  - `DB_NAME=yakkaw_db`
  - `SERVER_PORT=8080` (optional; currently hardcoded in code to 8080)
  - `API_URL=https://yakkaw.mfu.ac.th/api/yakkaw/devices` (optional; background fetch)
- Run from `backend/`:
  - `go mod tidy`
  - `go run .`
- Server listens on `http://localhost:8080` and will AutoMigrate tables.

3) Frontend
- From `frontend/`:
  - `npm install` (or `bun install`)
  - `npm run dev` (or `bun dev`)
- App runs on `http://localhost:3000` and calls backend at `http://localhost:8080`.

4) Docker (optional, backend + Postgres)
- From `backend/`: `docker-compose up --build`

## Environment and Configuration
- Backend reads DB config from env. JWT secret is currently hardcoded in middleware; prefer moving this to env `JWT_SECRET` when making auth changes.
- CORS in `backend/main.go` permits `http://localhost:3000` plus broad patterns; lock down origins via env for production.
- Frontend hardcodes API base to `http://localhost:8080` in `frontend/utils/api.ts` and some hooks. If you change API URL, update these locations or introduce `NEXT_PUBLIC_API_BASE_URL`.

## API Overview (Routes)
- Public
  - `POST /register`, `POST /login`, `POST /logout`
  - `GET /devices`, `GET /devices/:dvid`
  - `GET /categories`, `GET /categories/:id`
  - `GET /news`, `GET /news/:id`
  - `GET /sponsors`, `GET /notifications`, `GET /me`
  - Air Quality + Chart Data: 
    - `GET /api/airquality/one_week`, `/one_month`, `/three_months`, `/one_year`, `/province_average`, `/sensor_data/week`, `/one_year_series`
    - `GET /api/chartdata`, `/api/chartdata/today`, `GET /api/airquality/latest`
- Admin (JWT-protected via cookie)
  - Devices: `POST /admin/devices`, `PUT /admin/devices/:dvid`, `DELETE /admin/devices/:id`
  - Color ranges: `POST /admin/colorranges`, `PUT /admin/colorranges/:id`, `DELETE /admin/colorranges/:id`
  - Categories: `POST /admin/categories`, `PUT /admin/categories/:id`, `DELETE /admin/categories/:id`
  - News: `POST /admin/news`, `PUT /admin/news/:id`, `DELETE /admin/news/:id`
  - Dashboard/Notifications: `GET /admin/dashboard`, CRUD under `/admin/notifications`

## Coding Conventions
- General
  - Keep changes tightly scoped; do not refactor unrelated code.
  - Prefer environment-driven configuration over hardcoding.
  - Follow existing folder structure; do not introduce new top-level packages unless agreed.

- Go (backend)
  - Use Echo for routing and middleware (`github.com/labstack/echo/v4`).
  - Use GORM for persistence; define entities in `models/` and migrate in `database.Init()`.
  - Place business logic in `services/`; keep controllers thin.
  - Prefer context-aware DB calls and clear error mapping (404 vs 500).
  - Authentication: Standardize on `github.com/golang-jwt/jwt/v4`; load secret from env when modifying auth paths.
  - Logging: Use `utils.GetLogger()` or Echo’s logger consistently.

- TypeScript/Next.js (frontend)
  - Use the `api.ts` axios instance; avoid hardcoding URLs in hooks/components when possible.
  - Keep UI components in `src/components/ui/` and domain hooks in `src/hooks/`.
  - Use functional components and keep stateful logic in hooks.
  - Keep styling with Tailwind and shadcn/ui patterns already present.

## Common Agent Tasks and Entry Points
- Add a new backend endpoint
  - Model in `backend/models/`, service in `backend/services/`, controller in `backend/controllers/`.
  - Register the route in `backend/routes/routes.go`.
  - Add validation and consistent error responses.

- Extend admin-protected operations
  - Ensure routes are under the `/admin` group in `routes.go` and covered by JWT middleware.
  - In middleware, set both `user` (claims) and `userRole` in context if you update auth.

- Frontend data integration
  - Create a hook in `frontend/src/hooks/` to fetch data (use `api.ts`).
  - Render with existing UI components under `src/components/ui/`.
  - For admin actions, use `withCredentials: true`/cookies to align with backend auth.

## Known Pitfalls (Do Not “fix” silently)
- JWT secrets are hardcoded and inconsistent in some files; if you touch auth, propose a unified change.
- CORS is broad in dev; for production, narrow origins via env.
- Some models duplicate `ID` while embedding `gorm.Model`; don’t change schema unless the task requires it.
- Background fetch loop in `main.go` lacks timeout/backoff; altering this is out-of-scope unless requested.

## Quick Commands
- Backend
  - `cd backend && go run .`
  - `cd backend && go mod tidy`
- Frontend
  - `cd frontend && npm install && npm run dev`
- Docker (backend + DB)
  - `cd backend && docker-compose up --build`

## Review and Testing
- Frontend: `npm run lint` in `frontend/`.
- Backend: no linter configured; you may use `go fmt ./...` and `go vet ./...` locally.
- Prefer adding focused tests only where a test framework already exists (none currently).

## Communication to Maintainers
- When a change requires cross-cutting updates (e.g., JWT refactor, CORS policy), leave a concise note in PR descriptions and update this file if conventions change.

