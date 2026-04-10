import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

/**
 * Logs every HTTP request with method, path, status code, and duration.
 * Structured fields are picked up by Promtail and forwarded to Loki.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@InjectPinoLogger(LoggingInterceptor.name) private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.info(
            {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration: Date.now() - start,
              requestId: req.headers['x-request-id'],
            },
            'HTTP request completed',
          );
        },
        error: (err: unknown) => {
          this.logger.error(
            {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration: Date.now() - start,
              requestId: req.headers['x-request-id'],
              error: err instanceof Error ? err.message : String(err),
            },
            'HTTP request failed',
          );
        },
      }),
    );
  }
}
