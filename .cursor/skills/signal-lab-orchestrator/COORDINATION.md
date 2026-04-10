# Orchestrator — Subagent Coordination Prompts

This file contains the prompt templates used for each phase.
The orchestrator fills in `{{variables}}` before dispatching.

---

## Phase 1 — PRD Analysis

```
You are a PRD analyst. Read the following PRD and extract:
1. A list of features (user-facing capabilities)
2. A list of technical constraints (must-use libraries, forbidden patterns)
3. A list of acceptance criteria (verifiable conditions)

PRD content:
{{prd_content}}

Output as JSON:
{
  "features": [...],
  "constraints": [...],
  "acceptanceCriteria": [...]
}
Be concise. Each item should be one sentence.
```

---

## Phase 2 — Codebase Scan

```
You are a codebase analyst. Given the following project structure and PRD features,
identify which files need to be created or modified.

Project structure:
{{file_tree}}

Features to implement:
{{features}}

Output as JSON:
{
  "filesToCreate": ["path/to/file.ts", ...],
  "filesToModify": ["path/to/existing.ts", ...],
  "notes": "any important observations"
}
```

---

## Phase 3 — Planning

```
You are a senior engineer planning the implementation of a PRD for Signal Lab.

PRD features: {{features}}
Constraints: {{constraints}}
Existing codebase notes: {{codebase_notes}}

Produce a high-level implementation plan:
1. List the implementation phases in dependency order
2. Identify the riskiest integration points
3. Note any reuse opportunities from existing code

Be concise — this is a planning document, not an implementation.
```

---

## Phase 4 — Decomposition

```
You are decomposing an implementation plan into atomic tasks for Signal Lab.

Plan: {{plan}}
Constraints: {{constraints}}

For each task, output:
{
  "id": "task-NNN",
  "title": "short title",
  "description": "1-3 sentences describing exactly what to do",
  "type": "database|backend|frontend|infra",
  "complexity": "low|medium|high",
  "model": "fast|default",
  "dependsOn": ["task-NNN", ...],
  "skill": "prisma-schema-skill|nestjs-endpoint-skill|observability-skill|none"
}

Model assignment rules:
- fast: single-file changes, adding fields, creating DTOs, simple components
- default: multi-system integration, architecture decisions, complex logic

Target: 80% fast, 20% default. Aim for 8-15 tasks total.
```

---

## Phase 5 — Task Implementation

```
You are implementing task {{task_id}} for Signal Lab.

Task: {{task_title}}
Description: {{task_description}}
Type: {{task_type}}
Skill to follow: {{skill_name}}

Relevant context:
{{relevant_files}}

Implement this task completely. Follow the patterns in .cursor/rules/ and the
referenced skill. After completing, provide a one-sentence summary of what was done.
```

---

## Phase 6 — Domain Review

```
You are reviewing the {{domain}} implementation for Signal Lab against the PRD.

Acceptance criteria for this domain:
{{acceptance_criteria}}

Files to review (readonly):
{{domain_files}}

For each criterion, output:
- ✅ PASS: criterion met, brief evidence
- ❌ FAIL: criterion not met, specific issue and fix needed

If any criteria fail, provide the exact code change needed.
```

---

## Phase 7 — Final Report

```
You are generating the final execution report for a Signal Lab PRD run.

Execution summary:
{{execution_summary}}

Generate a concise report covering:
1. Overall status (completed/partial/failed)
2. Task counts (completed/failed/retried)
3. Model usage (fast/default counts)
4. What was completed
5. What failed and why
6. Actionable next steps

Keep it under 30 lines. Be direct.
```
