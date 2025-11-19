# Yakkaw Dashboard Architecture

## 1. System Overview
Yakkaw Dashboard is a two-tier web platform that combines:

- A Go (Echo) backend API (`backend/main.go`) that exposes REST endpoints for sensor management, charts, auth, sponsors, notifications, and QR utilities.
- A Next.js 15 frontend (`frontend/`) that renders the dashboard UI with Tailwind CSS, shadcn/ui components, and rich visualizations (Chart.js, Recharts).
- PostgreSQL for the system of record (`backend/database/db.go`).
- Optional Redis caching for expensive endpoints (`backend/cache/redis.go`, `backend/middlewares/one_year.go`).

The backend also ingests external device telemetry from an upstream API (`config/config.go`) every five minutes and persists the normalized data via the `services` layer.

## 2. Component Breakdown
| Component | Responsibilities | Key References |
|-----------|-----------------|----------------|
| **API Gateway (Echo)** | Bootstraps middleware (logging, CORS, JWT auth), registers all routes, starts background ingestion workers | `backend/main.go`, `backend/routes` |
| **Controllers & Services** | Encapsulate business logic for devices, sponsors, notifications, users, AQI charts, QR flows | `backend/controllers/*`, `backend/services/*` |
| **Database Layer** | Configures GORM, auto-migrates domain models, retries connection until PostgreSQL is reachable | `backend/database/db.go`, `backend/models/*` |
| **Caching** | Provides Redis client and cache decorators for high-read endpoints such as one-year AQI data | `backend/cache/redis.go`, `backend/middlewares/one_year.go` |
| **Frontend (Next.js)** | Renders dashboards, tables, and visualizations, and calls backend REST endpoints via Axios/fetch | `frontend/src`, `frontend/package.json`, `frontend/next.config.ts` |
| **External Services** | Devices API (`API_URL`) supplies ground-truth sensor readings that the backend ingests every 5 minutes; Google Maps and OAuth endpoints are consumed from the frontend via env-configured URLs | `backend/config/config.go`, `frontend/.env*` |

## 3. Data Flow
1. **Device ingestion pipeline**
   - `main.go` spawns a goroutine that calls `services.FetchAndStoreData(apiURL)` on a 5-minute interval.
   - The service hits the upstream API (`API_URL`), normalizes the payloads into `models.SensorData`, and persists them to PostgreSQL via GORM.
   - Cached aggregates (chart data, rankings) are refreshed on demand and optionally stored in Redis for 5 minutes to reduce query pressure.

2. **Client request cycle**
   - Users interact with the Next.js app hosted separately (e.g., on Vercel, Cloud Run, or a static host on GCE). The frontend reads runtime configuration from environment variables (`next.config.ts`) to locate the backend API and mapping services.
   - Browser requests flow to the frontend, which either renders static content or issues REST calls to the Echo API.
   - Echo authenticates protected routes using JWT cookies, enforces rate limits (e.g., `middlewares/one_year.go`), and queries PostgreSQL to satisfy the request.
   - Responses optionally go through Redis-backed cache layers before being serialized back to the client.

3. **Administration flows**
   - Admin users log in via `/login`, receive `access_token` cookies, and operate CRUD endpoints for sponsors, notifications, news, devices, and color ranges. Controllers enforce role checks and rely on the services layer for validation and persistence.

## 4. Deployment Topology
- **Backend Container:** Built from `backend/Dockerfile` (distroless runtime containing only the compiled `main` binary). The container exposes port `8080` and requires environment variables for DB credentials, JWT secret, and upstream URLs.
- **PostgreSQL:** Managed service (Cloud SQL) or self-hosted instance reachable from the Compute Engine VM. Connection details are provided via env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- **Redis (optional):** Deploy Redis (e.g., Memorystore) when enabling the caching middleware; set `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASS`.
- **Frontend:** Deploy independently (e.g., Next.js static export served from Cloud Storage + Cloud CDN or SSR runtime). Configure `NEXT_PUBLIC_*` env vars to point to the backend VM’s public endpoint.

## 5. Reliability & Security Considerations
- **Retries:** `database/db.go` retries database connections for up to ~30 seconds to tolerate slow-starting Postgres containers.
- **CORS:** Allowed origins are configured via `FRONTEND_ORIGINS`; ensure production domains are listed.
- **Secrets:** `JWT_SECRET`, Postgres credentials, and upstream API tokens should be stored in Secret Manager or VM metadata, not committed to source control.
- **Scaling:** Stateless backend + distroless container allows easy horizontal scaling behind a load balancer. Cron ingestion job runs per instance, so dedicate one worker or guard via distributed locks if multiple replicas will run simultaneously.
