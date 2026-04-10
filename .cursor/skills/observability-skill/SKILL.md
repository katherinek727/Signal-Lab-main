---
name: observability-skill
description: Add Prometheus metrics, structured Pino logs, and Sentry integration to a new NestJS endpoint following Signal Lab conventions.
version: 1.0.0
---

# Observability Skill

## When to Use

Use this skill whenever you:
- Add a new NestJS service method or endpoint
- Need to verify an existing endpoint is fully observable
- Want to add metrics/logging to an existing service that lacks them

Do NOT use this skill for frontend code or Prisma schema changes.

## What This Skill Does

Guides you through adding all three observability pillars to a NestJS service method:
1. Prometheus counter + histogram via `MetricsService`
2. Structured Pino log with required fields via `@InjectPinoLogger`
3. Sentry breadcrumb or exception capture via `SentryService`

---

## Step 1 — Inject dependencies

In your service constructor, add:

```ts
constructor(
  // ... existing deps
  private readonly metrics: MetricsService,
  private readonly sentry: SentryService,
  @InjectPinoLogger(YourService.name) private readonly logger: PinoLogger,
) {}
```

Import `MetricsModule` in your module's `imports` array.

---

## Step 2 — Add Prometheus metrics

### Register in MetricsModule (if new metric needed)

```ts
// apps/backend/src/metrics/metrics.module.ts
makeCounterProvider({
  name: 'your_domain_operations_total',
  help: 'Total operations in your domain',
  labelNames: ['operation', 'status'],
}),
```

### Record in service method

```ts
// On success
this.metrics.recordScenarioRun(type, 'completed', duration);

// For custom metrics — inject and call directly
this.myCounter.inc({ operation: 'create', status: 'success' });
```

**Rules:**
- Counter names: `<domain>_<noun>_total`
- Histogram names: `<domain>_<noun>_seconds`
- Duration always in **seconds** (divide ms by 1000)
- Max 3 label dimensions, enum values only

---

## Step 3 — Add structured logging

```ts
// Success path
this.logger.info(
  {
    scenarioId: run.id,
    scenarioType: type,
    duration,           // ms
  },
  'Operation completed successfully',
);

// Warning path (expected failure)
this.logger.warn(
  {
    scenarioId: run.id,
    scenarioType: type,
    duration,
    error: errorMessage,
  },
  'Operation failed with expected error',
);

// Error path (unexpected failure)
this.logger.error(
  {
    scenarioId: run.id,
    scenarioType: type,
    duration,
    error: err instanceof Error ? err.message : String(err),
  },
  'Unexpected error in operation',
);
```

**Required fields:** `scenarioId`, `scenarioType`, `duration`
**Never log:** passwords, tokens, DSNs, full request bodies

---

## Step 4 — Add Sentry integration

```ts
// For unexpected errors (500-level) — creates a Sentry issue
this.sentry.captureException(error, {
  scenarioId: run.id,
  scenarioType: type,
});

// For expected failures (400-level) — adds to Sentry breadcrumb trail
this.sentry.addBreadcrumb({
  message: errorMessage,
  category: 'your.domain',
  level: 'warning',
  data: { scenarioId: run.id, type },
});
```

---

## Step 5 — Verify

Run the scenario and check:
- [ ] `GET localhost:3001/metrics` shows your counter incremented
- [ ] Grafana → Explore → Prometheus: query your metric name
- [ ] Grafana → Explore → Loki: `{app="signal-lab"} | json | scenarioType="your_type"`
- [ ] Sentry dashboard shows exception (for error scenarios)

---

## Complete example

See `apps/backend/src/scenarios/scenarios.service.ts` for a full reference implementation covering all 5 scenario types.
