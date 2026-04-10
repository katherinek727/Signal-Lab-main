# /check-obs

Audit a NestJS service or controller for observability completeness.

## Usage

```
/check-obs [file-path]
```

**Examples:**
- `/check-obs apps/backend/src/scenarios/scenarios.service.ts`
- `/check-obs` — audits the currently open file

---

## Instructions for Cursor

When this command is invoked, read the target file and check each item below.
Output a checklist with ✅ / ❌ / ⚠️ for each item.

### Prometheus metrics
- [ ] `MetricsService` is injected in the constructor
- [ ] Every public method that performs an operation calls `this.metrics.record*()`
- [ ] Duration is measured (`Date.now()` before and after) and passed to the metric
- [ ] Duration is converted to seconds (divided by 1000) for histograms
- [ ] No `new Counter()` or `new Histogram()` instantiated directly

### Structured logging
- [ ] `@InjectPinoLogger(ServiceName.name)` is present in the constructor
- [ ] Every success path calls `this.logger.info({ ... }, 'message')`
- [ ] Every expected failure calls `this.logger.warn({ ... }, 'message')`
- [ ] Every unexpected failure calls `this.logger.error({ ... }, 'message')`
- [ ] Log objects include `scenarioId` (or equivalent record ID) and `duration`
- [ ] No `console.log` calls present

### Sentry
- [ ] `SentryService` is injected in the constructor
- [ ] 500-level errors call `this.sentry.captureException(err, { ... })`
- [ ] 400-level errors call `this.sentry.addBreadcrumb({ ... })`
- [ ] No direct `import * as Sentry` in this file

### General
- [ ] No `any` types
- [ ] No raw SQL (`$queryRaw`, `$executeRaw`)
- [ ] Errors thrown are NestJS `HttpException` subclasses

### Output format

For each failed check, provide:
1. The specific line or pattern that needs fixing
2. The corrected code snippet
3. Which rule file covers this: `observability-conventions.mdc`, `stack-constraints.mdc`, or `error-handling.mdc`
