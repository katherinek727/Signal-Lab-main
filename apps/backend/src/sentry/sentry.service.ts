import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

export interface SentryBreadcrumb {
  message: string;
  category: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}

/**
 * Thin wrapper around the Sentry SDK.
 * All other services depend on this — never import @sentry/node directly.
 */
@Injectable()
export class SentryService {
  /**
   * Capture an exception and send it to Sentry.
   * Attaches extra context tags for filtering in the Sentry dashboard.
   */
  captureException(
    error: unknown,
    context: { scenarioId: string; scenarioType: string },
  ): void {
    Sentry.withScope((scope) => {
      scope.setTag('scenarioType', context.scenarioType);
      scope.setTag('scenarioId', context.scenarioId);
      scope.setContext('scenario', context);
      Sentry.captureException(error);
    });
  }

  /**
   * Add a breadcrumb — useful for validation errors that don't warrant
   * a full exception capture but should appear in the Sentry trail.
   */
  addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level ?? 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1_000,
    });
  }

  /**
   * Flush pending events — call during graceful shutdown.
   */
  async flush(timeoutMs = 2_000): Promise<void> {
    await Sentry.flush(timeoutMs);
  }
}
