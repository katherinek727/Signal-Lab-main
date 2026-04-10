# /add-endpoint

Scaffold a complete NestJS endpoint with full observability for Signal Lab.

## Usage

```
/add-endpoint <domain> <operation> [description]
```

**Examples:**
- `/add-endpoint alerts create "Create a new alert rule"`
- `/add-endpoint reports generate "Generate a scenario summary report"`

---

## Instructions for Cursor

When this command is invoked, perform the following steps in order:

### 1. Parse the input
Extract:
- `domain` — the module name (e.g. `alerts`)
- `operation` — the action (e.g. `create`, `list`, `delete`)
- `description` — optional human description

### 2. Create the DTO
Create `apps/backend/src/<domain>/dto/<operation>-<domain>.dto.ts`:
- Use `class-validator` decorators on every field
- Add `@ApiProperty` with example and description
- Use `!` for required fields, `?` for optional

### 3. Create the Controller
Create `apps/backend/src/<domain>/<domain>.controller.ts`:
- `@ApiTags('<domain>')`
- `@ApiOperation({ summary: '<description>' })`
- `@ApiResponse` for 200, 400, 500
- `@HttpCode(HttpStatus.OK)` on POST

### 4. Create the Service
Create `apps/backend/src/<domain>/<domain>.service.ts`:
- Inject: `PrismaService`, `MetricsService`, `SentryService`, `PinoLogger`
- Record start time, compute duration
- Log with `{ recordId, duration }` on success
- Log with `{ error, duration }` on failure
- Call `this.metrics.recordScenarioRun(...)` or register a new metric

### 5. Create the Module
Create `apps/backend/src/<domain>/<domain>.module.ts`:
- Import `LoggerModule`, `MetricsModule`
- Declare controller and provider
- Export the service

### 6. Register in AppModule
Add the new module to the `imports` array in `apps/backend/src/app.module.ts`.

### 7. Verify observability
Confirm:
- Prometheus metric registered and recorded
- Pino log emitted with required fields (`scenarioId`/`recordId`, `duration`)
- Sentry wired for error path

### 8. Reference
Follow `.cursor/skills/nestjs-endpoint-skill/SKILL.md` and
`.cursor/skills/observability-skill/SKILL.md` for exact patterns.
