# Signal Lab — Submission Checklist

---

## Repository

- **URL**: `https://github.com/<your-username>/signal-lab`
- **Branch**: `main`
- **Time spent**: ~10 hours

---

## Start / Stop

```bash
# Start
cp .env.example .env
docker compose up -d

# Verify
curl http://localhost:3001/api/health

# Stop
docker compose down

# Stop + wipe volumes
docker compose down -v
```

**Prerequisites**: Docker Desktop 24+, Docker Compose v2.24+

---

## Stack confirmation

| Technology | Used | Where |
|-----------|:----:|-------|
| Next.js 14 (App Router) | ✅ | `apps/frontend/src/app/` |
| shadcn/ui | ✅ | `apps/frontend/src/components/ui/` |
| Tailwind CSS | ✅ | `apps/frontend/tailwind.config.ts` |
| TanStack Query | ✅ | `apps/frontend/src/components/scenarios/` |
| React Hook Form | ✅ | `apps/frontend/src/components/scenarios/scenario-form.tsx` |
| NestJS | ✅ | `apps/backend/src/` |
| PostgreSQL | ✅ | Docker Compose `postgres` service |
| Prisma | ✅ | `prisma/schema.prisma` |
| Sentry | ✅ | `apps/backend/src/sentry/` |
| Prometheus | ✅ | `apps/backend/src/metrics/`, `infra/prometheus/` |
| Grafana | ✅ | `infra/grafana/` |
| Loki | ✅ | `infra/loki/`, `infra/promtail/` |

---

## Observability verification

| Signal | How to reproduce | Where to see it |
|--------|-----------------|----------------|
| Prometheus metric | Run any scenario from UI | `curl localhost:3001/metrics \| grep scenario_runs_total` |
| Grafana dashboard | Run 2–3 scenarios | `localhost:3100` → Signal Lab dashboard |
| Loki log | Run any scenario | Grafana → Explore → Loki → `{app="signal-lab"} \| json` |
| Sentry exception | Run `system_error` scenario | Sentry project dashboard (requires SENTRY_DSN in .env) |

---

## Cursor AI Layer

### Custom Skills

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `observability-skill` | Step-by-step guide for adding metrics, logs, Sentry to any backend method |
| 2 | `nestjs-endpoint-skill` | Full NestJS module scaffold with observability from day one |
| 3 | `prisma-schema-skill` | Safe schema change workflow: model/field/enum + migration + type updates |
| 4 | `signal-lab-orchestrator` | 7-phase PRD executor with context.json state and resume support |

### Commands

| # | Command | What it does |
|---|---------|-------------|
| 1 | `/add-endpoint` | Scaffolds a complete NestJS endpoint in 8 steps |
| 2 | `/check-obs` | Audits a service for observability completeness |
| 3 | `/run-prd` | Runs the orchestrator pipeline on a PRD file |

### Hooks

| # | Hook | Problem solved |
|---|------|---------------|
| 1 | `after-schema-change` | Reminds to migrate + update DTOs when schema.prisma is saved |
| 2 | `after-new-endpoint` | Audits observability completeness when a new service/controller is created |

### Rules

| # | Rule file | What it enforces |
|---|----------|-----------------|
| 1 | `stack-constraints.mdc` | Allowed/forbidden libraries, no `any`, no `console.log` |
| 2 | `observability-conventions.mdc` | Metric naming, log fields, Sentry routing |
| 3 | `prisma-patterns.mdc` | No raw SQL, migration workflow, index requirements |
| 4 | `frontend-patterns.mdc` | TanStack Query patterns, RHF+Zod, shadcn usage |
| 5 | `error-handling.mdc` | Exception types, loading states, empty states |

### Marketplace Skills

| # | Skill | Why connected |
|---|-------|--------------|
| 1 | `nextjs-best-practices` | App Router patterns, server vs client components |
| 2 | `shadcn-ui` | All primitives and variants |
| 3 | `tailwind-v4-shadcn` | Tailwind utilities + design token usage |
| 4 | `nestjs-best-practices` | Module structure, DI, guards, interceptors |
| 5 | `prisma-orm` | Schema syntax, migration workflow, query API |
| 6 | `docker-expert` | Multi-stage builds, compose networking, health checks |
| 7 | `postgresql-table-design` | Index strategy, constraint naming |

**What custom skills cover that marketplace doesn't**: Signal Lab-specific observability wiring (which services to inject, required log fields, Prometheus naming), orchestrator pipeline and context.json schema, project-specific Prisma conventions.

---

## Orchestrator

- **Skill path**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Context file example**: `.execution/<timestamp>/context.json`
- **Phases**: 7 (Analysis → Codebase Scan → Planning → Decomposition → Implementation → Review → Report)
- **Fast model tasks**: ~80% (single-file changes, DTOs, metric registration, simple components)
- **Resume support**: yes — re-run with `--resume` flag, skips completed phases

---

## What I'd do with +4 hours

1. Add end-to-end tests (Playwright) for the verification walkthrough
2. Add a `slow_request` latency spike alert in Grafana
3. Implement the orchestrator's review loop with actual subagent calls
4. Add a `GET /api/scenarios/:id` endpoint for individual run details
5. Add dark mode toggle to the UI

---

## Defence questions (prepared answers)

**1. Why this skill decomposition?**
Each skill maps to a single concern a developer would reach for independently. `observability-skill` is the most-used — every new endpoint needs it. The orchestrator is separate because it's a meta-skill that coordinates the others.

**2. Which tasks suit a small model?**
Any task that is: single-file, has a clear template to follow, and doesn't require reasoning about trade-offs. Adding a Prisma field, creating a DTO, registering a metric — all fast. Architecture decisions and multi-system integrations need the default model.

**3. Marketplace vs custom skills?**
Marketplace skills know general patterns. Custom skills know Signal Lab's specific conventions — which services to inject, which fields are required on every log, how the orchestrator's state machine works. You can't get that from a generic NestJS skill.

**4. Which hooks reduce real errors?**
`after-schema-change` catches the most common mistake: editing the schema and forgetting to migrate. `after-new-endpoint` catches the second most common: shipping a service without metrics or logging. Both fire at exactly the right moment.

**5. How does the orchestrator save context?**
The main chat only holds orchestration logic (~15k tokens). All heavy work — reading files, writing code, running reviews — happens in focused subagent calls that each start with a clean, minimal context. State persists in `context.json` so nothing is lost between calls.
