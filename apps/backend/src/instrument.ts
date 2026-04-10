/**
 * Sentry instrumentation — must be imported FIRST in main.ts,
 * before any other module, so the SDK can patch Node.js internals.
 *
 * When SENTRY_DSN is not set the init() call is a safe no-op.
 */
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env['SENTRY_DSN'] || undefined,
  environment: process.env['NODE_ENV'] ?? 'development',
  release: process.env['npm_package_version'],

  // Capture 100 % of transactions in dev; tune down in production
  tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.2 : 1.0,

  // Attach request data (URL, method, headers) to every event
  integrations: [Sentry.httpIntegration()],

  // Scrub sensitive fields before sending
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
