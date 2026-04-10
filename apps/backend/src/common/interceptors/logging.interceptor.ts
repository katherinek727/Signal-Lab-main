import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

import { MetricsService } from '../../metrics/metrics.service';

/**
 * Logs every HTTP request with method, path, status code, and duration.
 * Also records http_requests_total Prometheus counter.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggingInterceptor.name) private readonly logger: PinoLogger,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.info(
            {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration,
              requestId: req.headers['x-request-id'],
            },
            'HTTP request completed',
          );
          this.metrics.recordHttpRequest(req.method, req.path, res.statusCode);
        },
        error: (err: unknown) => {
          const duration = Date.now() - start;
          // Status code may not be set yet on error — default to 500
          const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
          this.logger.error(
            {
              method: req.method,
              path: req.path,
              statusCode,
              duration,
              requestId: req.headers['x-request-id'],
              error: err instanceof Error ? err.message : String(err),
            },
            'HTTP request failed',
          );
          this.metrics.recordHttpRequest(req.method, req.path, statusCode);
        },
      }),
    );
  }
}
