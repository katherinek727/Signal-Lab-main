---
name: prisma-schema-skill
description: Safely add or modify Prisma models, enums, and fields — including migration creation, client regeneration, and TypeScript type updates.
version: 1.0.0
---

# Prisma Schema Skill

## When to Use

Use this skill when you need to:
- Add a new model to `prisma/schema.prisma`
- Add fields to an existing model
- Add or extend an enum
- Create and apply a migration

Do NOT use this skill for query logic changes (use nestjs-endpoint-skill instead).

---

## Step 1 — Edit the schema

File: `prisma/schema.prisma`

### Adding a new model

```prisma
model YourModel {
  id        String   @id @default(cuid())
  // required fields here
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt(sort: Desc)])
  @@map("your_models")
}
```

**Rules:**
- Table name: `snake_case` via `@@map`
- Always include `createdAt` + `updatedAt`
- Add `@@index` for every field used in WHERE/ORDER BY
- Use enums for status/type fields — never bare strings

### Adding a field to an existing model

```prisma
model ScenarioRun {
  // existing fields...
  newField  String?  @db.VarChar(255)  // nullable for backwards compat
}
```

**Rules:**
- New fields on existing models must be nullable (`?`) or have a `@default`
- Never remove fields in a migration — mark as deprecated in a comment first

### Adding an enum value

```prisma
enum ScenarioType {
  success
  validation_error
  system_error
  slow_request
  teapot
  your_new_type   // ← add here
}
```

---

## Step 2 — Create the migration

Run from `apps/backend/`:

```bash
npm run prisma:migrate:dev -- --name add_your_model
```

This will:
1. Generate SQL in `prisma/migrations/<timestamp>_add_your_model/migration.sql`
2. Apply the migration to your local dev database
3. Regenerate the Prisma client

**Never edit migration SQL files after committing them.**

---

## Step 3 — Regenerate the client (if needed)

If you only changed the schema without running migrate:

```bash
npm run prisma:generate
```

---

## Step 4 — Update TypeScript types

After schema changes, update:
- DTOs in `apps/backend/src/<domain>/dto/` to reflect new fields
- Frontend types in `apps/frontend/src/types/` if the API response shape changes

---

## Step 5 — Update seed (optional)

If the new model/field should have seed data, update `prisma/seed.ts`:

```ts
await prisma.yourModel.create({ data: { ... } });
```

Run: `npm run prisma:seed` (from `apps/backend/`)

---

## Step 6 — Verify

```bash
# Check migration applied
docker compose exec postgres psql -U signal -d signal_lab -c "\dt"

# Check new columns
docker compose exec postgres psql -U signal -d signal_lab -c "\d scenario_runs"
```

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---------|-----------------|
| Editing committed migration SQL | Create a new migration instead |
| Adding non-nullable field without default | Use `?` or `@default(value)` |
| Using raw SQL for schema changes | Always use `prisma migrate dev` |
| Forgetting `@@index` on query fields | Add index for every WHERE/ORDER BY field |
| Importing `PrismaClient` directly | Use injected `PrismaService` |
