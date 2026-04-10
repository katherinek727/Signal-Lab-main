import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  sentryDsn: string | undefined;
  frontendUrl: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['BACKEND_PORT'] ?? '3001', 10),
    databaseUrl: process.env['DATABASE_URL'] ?? '',
    sentryDsn: process.env['SENTRY_DSN'] || undefined,
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  }),
);
