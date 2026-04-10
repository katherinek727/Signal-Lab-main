# Orchestrator — Example Run

This shows a complete execution trace for PRD 002 (Observability Demo).

---

## Invocation

```
/run-prd prds/002_prd-observability-demo.md
```

---

## Execution directory created

```
.execution/2026-04-08-14-30/
  context.json
```

---

## Phase 1 — PRD Analysis (fast, ~2 min)

Extracted from PRD 002:

```json
{
  "features": [
    "Scenario runner UI with RHF form and TanStack Query mutation",
    "Run history list with auto-refresh and status badges",
    "Prometheus metrics: scenario_runs_total, scenario_run_duration_seconds, http_requests_total",
    "Structured JSON logging to Loki via Promtail",
    "Sentry exception capture for system_error scenario",
    "Grafana dashboard with 3+ panels provisioned via Docker volume"
  ],
  "constraints": [
    "Use prom-client via @willsoto/nestjs-prometheus",
    "Logs must be JSON format (Pino)",
    "Dashboard must be provisioned — no manual import",
    "Sentry DSN from env variable"
  ],
  "acceptanceCriteria": [
    "4 scenario types work from UI",
    "GET /metrics returns Prometheus format",
    "Grafana dashboard has 3+ panels",
    "Logs filterable by scenarioType in Loki",
    "system_error visible in Sentry"
  ]
}
```

---

## Phase 2 — Codebase Scan (fast, ~1 min)

```json
{
  "filesToCreate": [
    "apps/backend/src/metrics/metrics.module.ts",
    "apps/backend/src/metrics/metrics.service.ts",
    "apps/backend/src/sentry/sentry.module.ts",
    "apps/backend/src/sentry/sentry.service.ts",
    "infra/grafana/dashboards/signal-lab.json"
  ],
  "filesToModify": [
    "apps/backend/src/scenarios/scenarios.service.ts",
    "apps/backend/src/app.module.ts",
    "apps/frontend/src/components/scenarios/scenario-form.tsx"
  ]
}
```

---

## Phase 4 — Decomposition (default, ~3 min)

| ID | Title | Model | Depends on |
|----|-------|-------|-----------|
| task-001 | Register Prometheus metrics in MetricsModule | fast | — |
| task-002 | Implement MetricsService.recordScenarioRun() | fast | task-001 |
| task-003 | Add Pino structured logging to ScenariosService | fast | — |
| task-004 | Implement SentryService with captureException | fast | — |
| task-005 | Wire MetricsService + SentryService into ScenariosService | default | task-002, task-003, task-004 |
| task-006 | Create Grafana dashboard JSON with 3 panels | fast | — |
| task-007 | Add Loki datasource to Grafana provisioning | fast | — |
| task-008 | Build ScenarioForm with RHF + TanStack mutation | default | — |

**Model split: 6 fast / 2 default = 75% fast**

---

## Phase 5 — Implementation trace

```
[14:32] task-001 → fast  → ✅ MetricsModule with 3 providers registered
[14:33] task-003 → fast  → ✅ Pino logger injected, all 5 scenario types log
[14:34] task-004 → fast  → ✅ SentryService with captureException + addBreadcrumb
[14:35] task-002 → fast  → ✅ recordScenarioRun() converts ms→s, increments counter
[14:38] task-005 → default → ✅ All 5 handlers wired: metrics + logs + Sentry
[14:40] task-006 → fast  → ✅ Dashboard JSON with 5 panels (runs, latency, errors, HTTP, logs)
[14:41] task-007 → fast  → ✅ Loki datasource added with uid: loki
[14:45] task-008 → default → ✅ ScenarioForm with select, RHF validation, mutation, toast
```

---

## Phase 6 — Review

```
Database:  ✅ ScenarioRun model has all required fields
Backend:   ✅ /metrics returns Prometheus format
           ✅ All 5 scenario types persist to DB
           ✅ system_error captured in Sentry
Frontend:  ✅ RHF form with Zod validation
           ✅ TanStack Query mutation + cache invalidation
           ✅ Loading state on button
Infra:     ✅ Grafana dashboard provisioned via volume mount
           ✅ Loki datasource with correct UID
```

---

## Phase 7 — Final Report

```
Signal Lab PRD 002 Execution — Complete

Tasks: 8 completed, 0 failed, 0 retries
Duration: ~15 min
Model usage: 6 fast, 2 default

Completed:
  ✓ Prometheus metrics (counter + histogram + HTTP counter)
  ✓ Structured Pino logging with scenarioType/scenarioId/duration
  ✓ Sentry exception capture + breadcrumbs
  ✓ Grafana dashboard (5 panels, auto-provisioned)
  ✓ Loki datasource provisioned
  ✓ ScenarioForm with full RHF + TanStack Query wiring

Next steps:
  - Run docker compose up -d and verify walkthrough
  - Set SENTRY_DSN in .env to activate Sentry captures
  - Open localhost:3100 to confirm Grafana dashboard loads
```
