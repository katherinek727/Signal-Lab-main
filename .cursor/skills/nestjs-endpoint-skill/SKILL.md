---
name: nestjs-endpoint-skill
description: Scaffold a complete NestJS endpoint (controller + service + DTOs + module wiring) following Signal Lab conventions, including observability from day one.
version: 1.0.0
---

# NestJS Endpoint Skill

## When to Use

Use this skill when you need to:
- Add a new REST endpoint to the Signal Lab backend
- Create a new NestJS module from scratch
- Add a new method to an existing service

Do NOT use this skill for frontend changes or database schema changes.

---

## Checklist

- [ ] DTO with class-validator decorators
- [ ] Controller with Swagger decorators
- [ ] Service with PrismaService + MetricsService + SentryService + PinoLogger
- [ ] Module wiring (imports, providers, exports)
- [ ] AppModule updated if new module

---

## Step 1 — Create the DTO

```ts
// src/<domain>/dto/create-<entity>.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class Create<Entity>Dto {
  @ApiProperty({ example: 'value', description: 'Field description' })
  @IsString()
  @MaxLength(120)
  field!: string;
}
```

**Rules:**
- Use `class-validator` decorators — never manual validation
- Use `!` (definite assignment) not `?` for required fields
- Add `@ApiProperty` to every field

---

## Step 2 — Create the Controller

```ts
// src/<domain>/<domain>.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('<domain>')
@Controller('<domain>')
export class <Domain>Controller {
  constructor(private readonly <domain>Service: <Domain>Service) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a <entity>' })
  @ApiResponse({ status: 200, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: Create<Entity>Dto): Promise<unknown> {
    return this.<domain>Service.create(dto);
  }
}
```

**Rules:**
- Always add `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- Use `@HttpCode(HttpStatus.OK)` on POST endpoints that return 200
- Return `Promise<unknown>` or a typed DTO — never `any`

---

## Step 3 — Create the Service

```ts
// src/<domain>/<domain>.service.ts
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { SentryService } from '../sentry/sentry.service';

@Injectable()
export class <Domain>Service {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly sentry: SentryService,
    @InjectPinoLogger(<Domain>Service.name) private readonly logger: PinoLogger,
  ) {}

  async create(dto: Create<Entity>Dto): Promise<{ id: string }> {
    const start = Date.now();

    const record = await this.prisma.<model>.create({ data: dto });
    const duration = Date.now() - start;

    this.logger.info({ recordId: record.id, duration }, '<Entity> created');
    // this.metrics.record...

    return { id: record.id };
  }
}
```

---

## Step 4 — Create the Module

```ts
// src/<domain>/<domain>.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { MetricsModule } from '../metrics/metrics.module';
import { <Domain>Controller } from './<domain>.controller';
import { <Domain>Service } from './<domain>.service';

@Module({
  imports: [LoggerModule, MetricsModule],
  controllers: [<Domain>Controller],
  providers: [<Domain>Service],
  exports: [<Domain>Service],
})
export class <Domain>Module {}
```

---

## Step 5 — Register in AppModule

```ts
// src/app.module.ts — add to imports array
import { <Domain>Module } from './<domain>/<domain>.module';

// inside @Module({ imports: [...] })
<Domain>Module,
```

---

## Step 6 — Add observability

Follow the **observability-skill** to add metrics, logging, and Sentry to the new service method.

---

## Reference implementation

See `apps/backend/src/scenarios/` for a complete example of this pattern.
