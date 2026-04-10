// !! Must be first — Sentry patches Node internals before anything else loads
import './instrument';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SentryService } from './sentry/sentry.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── Logging ──────────────────────────────────────────────────────────────
  app.useLogger(app.get(Logger));

  // ── Global prefix & versioning ───────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.NONE });

  // ── Global exception filter ──────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Validation ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── Swagger ──────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Signal Lab API')
    .setDescription('Observability playground — scenario runner API')
    .setVersion('1.0')
    .addTag('health', 'Service health checks')
    .addTag('scenarios', 'Scenario execution and history')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  app.enableShutdownHooks();
  const sentryService = app.get(SentryService);
  process.on('SIGTERM', () => void sentryService.flush());

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env['BACKEND_PORT'] ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀  Backend running on http://localhost:${port}/api`);
  logger.log(`📖  Swagger docs  → http://localhost:${port}/api/docs`);
  logger.log(`📊  Metrics       → http://localhost:${port}/metrics`);
}

void bootstrap();
