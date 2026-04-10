---
name: signal-lab-orchestrator
description: Multi-phase PRD executor for Signal Lab. Decomposes a PRD into atomic tasks, assigns fast/default models, persists state in context.json, and supports resume after interruption.
version: 1.0.0
---

# Signal Lab Orchestrator

## When to Use

Use this skill when you need to implement a full PRD end-to-end:
- `/run-prd prds/002_prd-observability-demo.md`
- `/run-prd prds/001_prd-platform-foundation.md --resume`

Do NOT use this skill for single-file edits or quick fixes — use the targeted skills instead.

---

## Core Principles

- **Context economy**: the main chat holds only orchestration logic (~15k tokens). All heavy work happens in focused subagent calls.
- **Atomic decomposition**: every task is completable in 5–10 minutes by a single model call.
- **Explicit model selection**: 80% of tasks use `fast` model; only architecture and integration tasks use `default`.
- **State persistence**: all progress lives in `.execution/<timestamp>/context.json` — never only in chat history.
- **Resumability**: re-running with `--resume` skips completed phases and continues from the last checkpoint.

---

## Pipeline Phases

| # | Phase | Model | What happens |
|---|-------|-------|-------------|
| 1 | PRD Analysis | fast | Extract features, constraints, acceptance criteria |
| 2 | Codebase Scan | fast | Map existing files, identify touch points |
| 3 | Planning | default | High-level implementation plan with rationale |
| 4 | Decomposition | default | Break plan into atomic tasks with dependencies |
| 5 | Implementation | fast (80%) / default (20%) | Execute tasks in dependency order |
| 6 | Review | fast (readonly) | Verify each domain against acceptance criteria |
| 7 | Report | fast | Generate final summary |

---

## Execution Instructions

### Phase 1 — PRD Analysis (fast)

Read the PRD file. Extract and write to `context.json`:

```json
{
  "prdPath": "prds/002_prd-observability-demo.md",
  "features": ["scenario runner UI", "prometheus metrics", "loki logging", "sentry integration", "grafana dashboard"],
  "constraints": ["must use prom-client", "logs must be JSON", "dashboard must be provisioned"],
  "acceptanceCriteria": ["4 scenario types work", "metrics visible at /metrics", "dashboard has 3+ panels"]
}
```

### Phase 2 — Codebase Scan (fast)

Scan the repo. Identify:
- Files that need modification
- Files that need creation
- Potential conflicts with existing code

Add to `context.json`:
```json
{
  "existingFiles": ["apps/backend/src/scenarios/scenarios.service.ts", "..."],
  "filesToCreate": ["infra/grafana/dashboards/signal-lab.json", "..."],
  "filesToModify": ["apps/backend/src/app.module.ts", "..."]
}
```

### Phase 3 — Planning (default)

Produce a high-level plan. Consider:
- Dependency order (database before service before controller before frontend)
- Risk areas (observability stack integration, Docker networking)
- Reuse opportunities (existing MetricsService, SentryService)

### Phase 4 — Decomposition (default)

Break the plan into atomic tasks. Each task must be:
- Completable in 5–10 minutes
- Described in 1–3 sentences
- Assigned a complexity and model

Write all tasks to `context.json`:

```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Add ScenarioRun model to Prisma schema",
      "description": "Add the ScenarioRun model with type enum, status enum, duration, error, and metadata fields. Run migration.",
      "type": "database",
      "complexity": "low",
      "model": "fast",
      "dependsOn": [],
      "status": "pending",
      "skill": "prisma-schema-skill"
    },
    {
      "id": "task-002",
      "title": "Implement ScenariosService with all 5 handlers",
      "description": "Implement success, validation_error, system_error, slow_request, and teapot handlers. Each must persist to DB, emit metrics, log, and handle Sentry.",
      "type": "backend",
      "complexity": "medium",
      "model": "default",
      "dependsOn": ["task-001"],
      "status": "pending",
      "skill": "nestjs-endpoint-skill"
    }
  ]
}
```

#### Model assignment rules

**fast model** — assign when the task is:
- Adding a field to Prisma schema
- Creating a DTO with class-validator
- Adding a Prometheus metric registration
- Creating a simple UI component
- Writing a Pino log call
- Updating an import or module registration

**default model** — assign when the task requires:
- Designing architecture or module structure
- Implementing complex business logic with multiple branches
- Integrating two or more systems (e.g. metrics + logging + Sentry together)
- Writing a review with trade-off analysis

### Phase 5 — Implementation (fast 80% / default 20%)

Execute tasks in dependency order. For each task:

1. Read current `context.json`
2. Check `dependsOn` — skip if any dependency is not `completed`
3. Select the appropriate skill from the `skill` field
4. Execute the task using the assigned model
5. Update `context.json`:

```json
{ "status": "completed", "completedAt": "2026-04-08T14:30:00Z", "result": "brief summary" }
```

If a task fails:
- Mark `status: "failed"`, add `"error": "what went wrong"`
- Continue with independent tasks
- Do not retry more than 3 times

#### Review loop (per domain)

After implementing all tasks in a domain (database / backend / frontend):

```
1. Run reviewer subagent (readonly) against the domain files
2. If review fails → run implementer with the feedback
3. Repeat up to 3 times
4. If still failing → mark domain as "needs_attention", continue
```

### Phase 6 — Review (fast, readonly)

For each domain, verify against the PRD acceptance criteria:

```
Database:  schema matches PRD model definition?
Backend:   all endpoints return correct shapes? metrics registered?
Frontend:  all UI requirements met? RHF + TanStack Query used correctly?
Infra:     docker-compose valid? Grafana dashboard provisioned?
```

Output a review report per domain with pass/fail per criterion.

### Phase 7 — Report (fast)

Generate the final report:

```
Signal Lab PRD Execution — Complete

Tasks: X completed, Y failed, Z retries
Duration: ~N min
Model usage: A fast, B default

Completed: [list]
Failed: [list with reason]
Needs attention: [list]

Next steps: [actionable items for failed/attention items]
```

Update `context.json` with `status: "completed"`.

---

## context.json Full Schema

```json
{
  "executionId": "2026-04-08-14-30",
  "prdPath": "prds/002_prd-observability-demo.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "startedAt": "2026-04-08T14:30:00Z",
  "signal": 42,
  "phases": {
    "analysis":       { "status": "completed", "result": "..." },
    "codebase":       { "status": "completed", "result": "..." },
    "planning":       { "status": "completed", "result": "..." },
    "decomposition":  { "status": "completed", "result": "..." },
    "implementation": { "status": "in_progress", "completedTasks": 5, "totalTasks": 8 },
    "review":         { "status": "pending" },
    "report":         { "status": "pending" }
  },
  "tasks": [ ... ]
}
```

---

## Resume Behaviour

When `--resume` is passed or an existing `context.json` is found:

1. Read `.execution/*/context.json` (most recent by timestamp)
2. Skip all phases with `status: "completed"`
3. For `status: "in_progress"` — re-run from the first incomplete task
4. For `status: "failed"` — retry up to 3 times, then mark `needs_attention`
5. Preserve all completed task results — never re-run completed tasks

---

## Skill References

This orchestrator delegates to:
- `prisma-schema-skill` — database tasks
- `nestjs-endpoint-skill` — backend tasks
- `observability-skill` — metrics/logging/Sentry tasks
- Marketplace: `shadcn-ui`, `nestjs-best-practices`, `prisma-orm` — for implementation guidance
