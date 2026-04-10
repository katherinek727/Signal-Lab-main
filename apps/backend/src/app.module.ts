import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';

import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      cache: true,
    }),

    // ── Structured logging (Pino → Loki via Promtail) ────────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        base: { app: 'signal-lab', service: 'backend' },
        redact: ['req.headers.authorization'],
      },
    }),

    // ── Prometheus metrics endpoint (/metrics) ───────────────────────────────
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),

    // ── Domain modules ───────────────────────────────────────────────────────
    PrismaModule,
    HealthModule,
    ScenariosModule,
  ],
})
export class AppModule {}
