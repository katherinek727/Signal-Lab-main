# Signal Lab — Cursor AI Layer

A new Cursor chat in this repo gets full project context automatically.
No manual onboarding. No "what stack are you using?" questions.

---

## Rules (`.cursor/rules/`)

Five files, each with a tight scope. Applied automatically based on the file being edited.

| File | Scope | What it prevents |
|------|-------|-----------------|
| `stack-constraints.mdc` | All files | Wrong libraries (Redux, SWR, TypeORM), `any` types, `console.log` in services |
| `observability-conventions.mdc` | Backend | Wrong metric names, missing log fields, direct Sentry imports |
| `prisma-patterns.mdc` | Backend + schema | Raw SQL, missing indexes, editing committed migrations |
| `frontend-patterns.mdc` | Frontend | Raw fetch in components, missing query key factory, inline styles |
| `error-handling.mdc` | All files | Swallowed errors, wrong exception types, missing loading/empty states |

`stack-constraints.mdc` has `alwaysApply: true` — it loads in every chat.
The others load only when their glob patterns match the open file.

---

## Custom Skills (`.cursor/skills/`)

Three skills that cover what marketplace skills can't — Signal Lab-specific patterns.

| Skill | When to use |
|-------|------------|
| `observability-skill` | Adding metrics, logs, or Sentry to any backend method |
| `nestjs-endpoint-skill` | Scaffolding a new NestJS module from scratch |
| `prisma-schema-skill` | Adding models, fields, or enums + running migrations safely |
| `signal-lab-orchestrator` | Implementing a full PRD end-to-end via `/run-prd` |

**Why custom instead of marketplace?**
Marketplace skills know general patterns. These skills know Signal Lab's specific conventions:
- Which services to inject (`MetricsService`, `SentryService`, `PinoLogger`)
- Which fields are required on every log (`scenarioId`, `scenarioType`, `duration`)
- Which Prometheus naming convention to follow (`scenario_runs_total`)
- How the orchestrator's `context.json` schema works

---

## Commands (`.cursor/commands/`)

| Command | What it does |
|---------|-------------|
| `/add-endpoint <domain> <op>` | Scaffolds a complete NestJS endpoint with observability in 8 steps |
| `/check-obs [file]` | Audits a service for metrics/logging/Sentry completeness, outputs ✅/❌ per check |
| `/run-prd <path> [--resume]` | Runs the orchestrator pipeline on a PRD file |

---

## Hooks (`.cursor/hooks/`)

| Hook | Trigger | Problem it solves |
|------|---------|------------------|
| `after-schema-change` | `prisma/schema.prisma` saved | Reminds to run `prisma:migrate:dev`, update DTOs and frontend types |
| `after-new-endpoint` | New `*.controller.ts` or `*.service.ts` created | Audits observability completeness before the file is committed |

These hooks catch the two most common mistakes in this codebase:
1. Forgetting to migrate after a schema change
2. Shipping an endpoint without metrics or logging

---

## Marketplace Skills (`.cursor/mcp.json`)

Seven skills covering the full stack. Each fills a specific gap.

| Skill | Why connected |
|-------|--------------|
| `nextjs-best-practices` | App Router patterns, metadata API, server vs client components |
| `shadcn-ui` | All primitives and variants — prevents reinventing existing components |
| `tailwind-v4-shadcn` | Tailwind utilities + design token usage alongside shadcn |
| `nestjs-best-practices` | Module structure, DI, guards, interceptors, circular dependency prevention |
| `prisma-orm` | Schema syntax, migration workflow, query API |
| `docker-expert` | Multi-stage builds, compose networking, health checks |
| `postgresql-table-design` | Index strategy, constraint naming, data type selection |

**What custom skills cover that marketplace doesn't:**
- Signal Lab-specific observability wiring (which services to inject, which fields to log)
- The orchestrator pipeline and `context.json` schema
- Project-specific Prisma conventions (enum naming, `@@map` patterns, migration workflow)

---

## Orchestrator

The `signal-lab-orchestrator` skill implements a 7-phase PRD execution pipeline:

```
PRD Analysis → Codebase Scan → Planning → Decomposition
→ Implementation → Review → Report
```

Key properties:
- **80% fast model** — most tasks are single-file, low-complexity changes
- **State in `context.json`** — progress survives chat restarts
- **Resume support** — `--resume` skips completed phases
- **Review loop** — each domain gets up to 3 review/fix cycles before marking `needs_attention`

Invoke via: `/run-prd prds/002_prd-observability-demo.md`

See `.cursor/skills/signal-lab-orchestrator/EXAMPLE.md` for a full execution trace.
