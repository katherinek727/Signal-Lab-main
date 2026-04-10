import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram } from 'prom-client';

import type { ScenarioType } from '../scenarios/dto/run-scenario.dto';

type RunStatus = 'completed' | 'failed';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('scenario_runs_total')
    private readonly runsCounter: Counter<'type' | 'status'>,

    @InjectMetric('scenario_run_duration_seconds')
    private readonly durationHistogram: Histogram<'type'>,

    @InjectMetric('http_requests_total')
    private readonly httpCounter: Counter<'method' | 'path' | 'status_code'>,
  ) {}

  /**
   * Record a completed or failed scenario run.
   * Duration is in milliseconds — converted to seconds for Prometheus convention.
   */
  recordScenarioRun(type: ScenarioType, status: RunStatus, durationMs: number): void {
    this.runsCounter.inc({ type, status });
    this.durationHistogram.observe({ type }, durationMs / 1_000);
  }

  /**
   * Record an HTTP request. Called from the logging interceptor.
   */
  recordHttpRequest(method: string, path: string, statusCode: number): void {
    this.httpCounter.inc({
      method: method.toUpperCase(),
      path: this.normalisePath(path),
      status_code: String(statusCode),
    });
  }

  /**
   * Collapse dynamic path segments to avoid high-cardinality label explosion.
   * e.g. /api/scenarios/clxyz123 → /api/scenarios/:id
   */
  private normalisePath(path: string): string {
    return path
      .replace(/\/[0-9a-f]{8,}/gi, '/:id')   // hex IDs (cuid, uuid)
      .replace(/\/c[a-z0-9]{20,}/g, '/:id')   // cuid
      .split('?')[0] ?? path;                  // strip query string
  }
}
