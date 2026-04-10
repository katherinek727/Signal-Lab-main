import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string | undefined;
  };
}

/**
 * Wraps every successful response in a consistent envelope:
 * { data: T, meta: { timestamp, requestId } }
 *
 * Errors are handled by AllExceptionsFilter and are NOT wrapped here.
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const res = context.switchToHttp().getResponse<Response>();

    // Health endpoint returns its own shape — skip wrapping
    if (res.req?.url?.includes('/health')) {
      return next.handle() as Observable<ApiResponse<T>>;
    }

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        },
      })),
    );
  }
}
