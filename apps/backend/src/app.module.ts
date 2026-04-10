import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';

import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
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
        // Attach request-id to every log line
        customProps: (req: { headers: Record<string, string> }) => ({
          requestId: req.headers['x-request-id'],
        }),
      },
    }),

    // ── Prometheus metrics endpoint (/metrics) ───────────────────────────────
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),

    // ── Domain modules ───────────────────────────────────────────────────────
    PrismaModule,
    MetricsModule,
    HealthModule,
    ScenariosModule,
  ],

  providers: [
    // Global interceptors — applied to every route in declaration order
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
