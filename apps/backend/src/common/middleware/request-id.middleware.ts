import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Attaches a unique X-Request-ID header to every request so logs and
 * traces can be correlated across services.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
  }
}
