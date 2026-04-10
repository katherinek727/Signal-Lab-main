# /run-prd

Execute a Signal Lab PRD through the orchestrator pipeline.

## Usage

```
/run-prd <prd-path> [--resume]
```

**Examples:**
- `/run-prd prds/002_prd-observability-demo.md`
- `/run-prd prds/001_prd-platform-foundation.md --resume`

---

## Instructions for Cursor

When this command is invoked:

### 1. Check for existing execution context

Look for `.execution/*/context.json` files.

If `--resume` flag is present OR a `context.json` exists with `status: "in_progress"`:
- Read the existing `context.json`
- Skip completed phases
- Continue from `currentPhase`

Otherwise start fresh.

### 2. Invoke the orchestrator skill

Load `.cursor/skills/signal-lab-orchestrator/SKILL.md` and follow its pipeline:

```
Phase 1: PRD Analysis     → fast model
Phase 2: Codebase Scan    → fast model
Phase 3: Planning         → default model
Phase 4: Decomposition    → default model
Phase 5: Implementation   → fast (80%) / default (20%)
Phase 6: Review           → fast model (readonly)
Phase 7: Report           → fast model
```

### 3. Create execution directory

```
.execution/<YYYY-MM-DD-HH-mm>/
  context.json
```

### 4. Update context.json after each phase

```json
{
  "executionId": "<timestamp>",
  "prdPath": "<path>",
  "status": "in_progress",
  "currentPhase": "<phase>",
  "phases": { ... },
  "tasks": [ ... ]
}
```

### 5. On completion

Output the final report from Phase 7 and update `context.json` with `status: "completed"`.

### 6. On failure

Mark the failed task in `context.json` with `status: "failed"`.
Do not block remaining independent tasks.
Output which tasks failed and suggested next steps.

---

## Resume behaviour

When `--resume` is passed:
- Read `context.json`
- Skip phases with `status: "completed"`
- Re-run phases with `status: "in_progress"` or `status: "failed"`
- Preserve all completed task results
