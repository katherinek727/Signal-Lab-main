# Signal Lab

An observability playground. Press a button, watch the signal propagate through Prometheus, Loki, Grafana, and Sentry in real time.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | 24+ |
| Docker Compose | v2.24+ |
| Node.js | 20+ (local dev only) |

---

## Quick Start

```bash
# 1. Clone and enter the repo
git clone <repo-url> && cd signal-lab

# 2. Copy environment variables
cp .env.example .env

# 3. Start everything
docker compose up -d

# 4. Wait ~30 s for migrations to run, then verify
curl http://localhost:3001/api/health
```

Expected response:
```json
{ "status": "ok", "info": { "database": { "status": "up" } } }
```

---

## Service URLs

| Service | URL | Notes |
|---------|-----|-------|
| Signal Lab UI | http://localhost:3000 | Main application |
| Backend API | http://localhost:3001/api | REST API |
| Swagger Docs | http://localhost:3001/api/docs | Interactive API docs |
| Prometheus | http://localhost:9090 | Raw metrics |
| Grafana | http://localhost:3100 | Dashboards |
| Loki (via Grafana) | http://localhost:3100/explore | Log explorer |

---

## Verification Walkthrough

Complete this in under 5 minutes to confirm every signal is working.

### 1. UI loads
```
open http://localhost:3000
```
You should see the Signal Lab home page with the gradient brand icon.

### 2. Run a success scenario
- Navigate to **Runner** → select **success** → click **Run Scenario**
- A green "Completed" badge appears in the history panel on the right

### 3. Run a system_error scenario
- Select **system_error** → click **Run Scenario**
- A red "Failed" badge appears + toast with error message

### 4. Check Prometheus metrics
```bash
curl http://localhost:3001/metrics | grep scenario_runs_total
```
You should see counter lines like:
```
scenario_runs_total{type="success",status="completed"} 1
scenario_runs_total{type="system_error",status="failed"} 1
```

### 5. Open Grafana dashboard
```
open http://localhost:3100
```
- The **Signal Lab** dashboard loads automatically (provisioned)
- "Scenario Runs by Type" panel shows your runs
- "Latency Distribution" panel shows p50/p95/p99

### 6. Query Loki logs
- Grafana → **Explore** → select **Loki** datasource
- Run query: `{app="signal-lab"} | json`
- You should see structured logs with `scenarioType`, `scenarioId`, `duration` fields

### 7. Verify Sentry exception
- Open your Sentry project dashboard
- You should see an issue from the `system_error` run with tag `scenarioType: system_error`
- *(Requires `SENTRY_DSN` set in `.env`)*

### 8. Easter egg (bonus)
- Select **🫖 Teapot** → Run Scenario
- Response: HTTP 418 `{ "signal": 42, "message": "I'm a teapot" }`
- Run is stored with `metadata: { easter: true, signal: 42 }`

---

## Seed Data

To populate the history list with sample runs:

```bash
docker compose exec backend npm run prisma:seed
```

---

## Stop

```bash
docker compose down

# Remove volumes (wipes database and Grafana state)
docker compose down -v
```

---

## Local Development (without Docker)

```bash
# Backend
cd apps/backend
npm install
npm run prisma:migrate:dev
npm run start:dev

# Frontend (separate terminal)
cd apps/frontend
npm install
npm run dev
```

Requires a local PostgreSQL instance. Set `DATABASE_URL` in `.env`.

---

## Project Structure

```
signal-lab/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js 14 App Router
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # SQL migrations
│   └── seed.ts           # Sample data
├── infra/
│   ├── prometheus/       # Scrape config
│   ├── loki/             # Log aggregation config
│   ├── promtail/         # Log shipper config
│   └── grafana/          # Provisioned datasources + dashboard
├── .cursor/              # Cursor AI layer
│   ├── rules/            # Stack guardrails (5 files)
│   ├── skills/           # Custom skills (4 skills)
│   ├── commands/         # Workflow commands (3 commands)
│   ├── hooks/            # Automation hooks (2 hooks)
│   ├── mcp.json          # Marketplace skills (7 skills)
│   └── AI-LAYER.md       # AI layer documentation
└── docker-compose.yml    # Full stack in one command
```

---

## Cursor AI Layer

See `.cursor/AI-LAYER.md` for the full documentation.

Quick reference:

```bash
# Scaffold a new endpoint with observability
/add-endpoint <domain> <operation>

# Audit a service for observability completeness
/check-obs apps/backend/src/scenarios/scenarios.service.ts

# Run a PRD through the orchestrator pipeline
/run-prd prds/002_prd-observability-demo.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form |
| Backend | NestJS 10, TypeScript strict |
| Database | PostgreSQL 16, Prisma ORM |
| Metrics | Prometheus, prom-client |
| Logs | Pino → Promtail → Loki |
| Errors | Sentry |
| Dashboards | Grafana (provisioned) |
| Infra | Docker Compose |
