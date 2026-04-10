import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // For HTTP 418 (teapot) the body is already the full intended payload —
    // pass it through verbatim so the frontend receives { signal: 42, ... }.
    if (statusCode === HttpStatus.I_AM_A_TEAPOT && exception instanceof HttpException) {
      response.status(statusCode).json(exception.getResponse());
      return;
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exceptionResponse !== null && typeof exceptionResponse === 'object'
        ? ((exceptionResponse as { message?: unknown }).message ?? 'Internal server error')
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const body: ErrorResponse = {
      statusCode,
      message: Array.isArray(message) ? message.join(', ') : String(message),
      error: HttpStatus[statusCode] ?? 'UNKNOWN',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }
}
