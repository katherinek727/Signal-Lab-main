import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

import { MetricsService } from './metrics.service';

@Module({
  providers: [
    MetricsService,

    // ── scenario_runs_total ──────────────────────────────────────────────
    makeCounterProvider({
      name: 'scenario_runs_total',
      help: 'Total number of scenario runs, labelled by type and status',
      labelNames: ['type', 'status'],
    }),

    // ── scenario_run_duration_seconds ────────────────────────────────────
    makeHistogramProvider({
      name: 'scenario_run_duration_seconds',
      help: 'Scenario run execution time in seconds',
      labelNames: ['type'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    }),

    // ── http_requests_total ──────────────────────────────────────────────
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total HTTP requests handled by the backend',
      labelNames: ['method', 'path', 'status_code'],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
