import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ScenarioRun } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { SentryService } from '../sentry/sentry.service';
import type { RunScenarioDto } from './dto/run-scenario.dto';
import type { ScenarioResult } from './scenarios.types';

const SLOW_MIN_MS = 2_000;
const SLOW_MAX_MS = 5_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

@Injectable()
export class ScenariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly sentry: SentryService,
    @InjectPinoLogger(ScenariosService.name) private readonly logger: PinoLogger,
  ) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  async run(dto: RunScenarioDto): Promise<ScenarioResult> {
    switch (dto.type) {
      case 'success':        return this.runSuccess(dto);
      case 'validation_error': return this.runValidationError(dto);
      case 'system_error':   return this.runSystemError(dto);
      case 'slow_request':   return this.runSlowRequest(dto);
      case 'teapot':         return this.runTeapot(dto);
    }
  }

  async history(): Promise<ScenarioRun[]> {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ── Scenario handlers ──────────────────────────────────────────────────────

  private async runSuccess(dto: RunScenarioDto): Promise<ScenarioResult> {
    const start = Date.now();

    const run = await this.prisma.scenarioRun.create({
      data: { type: 'success', name: dto.name, status: 'pending' },
    });

    await sleep(randomBetween(50, 200));
    const duration = Date.now() - start;

    await this.prisma.scenarioRun.update({
      where: { id: run.id },
      data: { status: 'completed', duration },
    });

    this.logger.info(
      { scenarioId: run.id, scenarioType: 'success', duration },
      'Scenario completed successfully',
    );
    this.metrics.recordScenarioRun('success', 'completed', duration);

    return { id: run.id, status: 'completed', duration };
  }

  private async runValidationError(dto: RunScenarioDto): Promise<ScenarioResult> {
    const start = Date.now();
    const errorMessage = 'Scenario input failed validation: name must not be empty when provided';

    const run = await this.prisma.scenarioRun.create({
      data: { type: 'validation_error', name: dto.name, status: 'failed', error: errorMessage },
    });

    const duration = Date.now() - start;
    await this.prisma.scenarioRun.update({ where: { id: run.id }, data: { duration } });

    this.logger.warn(
      { scenarioId: run.id, scenarioType: 'validation_error', duration, error: errorMessage },
      'Scenario rejected due to validation error',
    );
    this.metrics.recordScenarioRun('validation_error', 'failed', duration);

    // Breadcrumb — visible in Sentry trail without creating a full issue
    this.sentry.addBreadcrumb({
      message: errorMessage,
      category: 'scenario.validation',
      level: 'warning',
      data: { scenarioId: run.id, type: 'validation_error' },
    });

    throw new BadRequestException(errorMessage);
  }

  private async runSystemError(dto: RunScenarioDto): Promise<ScenarioResult> {
    const start = Date.now();
    const errorMessage = 'Unhandled internal exception — intentional for observability demo';

    const run = await this.prisma.scenarioRun.create({
      data: { type: 'system_error', name: dto.name, status: 'failed', error: errorMessage },
    });

    const duration = Date.now() - start;
    await this.prisma.scenarioRun.update({ where: { id: run.id }, data: { duration } });

    this.logger.error(
      { scenarioId: run.id, scenarioType: 'system_error', duration, error: errorMessage },
      'System error scenario triggered',
    );
    this.metrics.recordScenarioRun('system_error', 'failed', duration);

    const exception = new InternalServerErrorException(errorMessage);

    // Full exception capture — appears as an issue in Sentry
    this.sentry.captureException(exception, {
      scenarioId: run.id,
      scenarioType: 'system_error',
    });

    throw exception;
  }

  private async runSlowRequest(dto: RunScenarioDto): Promise<ScenarioResult> {
    const start = Date.now();
    const delay = randomBetween(SLOW_MIN_MS, SLOW_MAX_MS);

    const run = await this.prisma.scenarioRun.create({
      data: { type: 'slow_request', name: dto.name, status: 'pending' },
    });

    await sleep(delay);
    const duration = Date.now() - start;

    await this.prisma.scenarioRun.update({
      where: { id: run.id },
      data: { status: 'completed', duration },
    });

    this.logger.warn(
      { scenarioId: run.id, scenarioType: 'slow_request', duration, delay },
      'Slow request scenario completed — latency spike recorded',
    );
    this.metrics.recordScenarioRun('slow_request', 'completed', duration);

    return { id: run.id, status: 'completed', duration };
  }

  private async runTeapot(dto: RunScenarioDto): Promise<ScenarioResult> {
    const start = Date.now();

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: 'teapot',
        name: dto.name,
        status: 'completed',
        metadata: { easter: true, signal: 42 },
      },
    });

    const duration = Date.now() - start;
    await this.prisma.scenarioRun.update({ where: { id: run.id }, data: { duration } });

    this.logger.info(
      { scenarioId: run.id, scenarioType: 'teapot', duration, signal: 42, easter: true },
      "I'm a teapot",
    );
    this.metrics.recordScenarioRun('teapot', 'completed', duration);

    throw new HttpException(
      { id: run.id, signal: 42, message: "I'm a teapot", status: 'completed', duration },
      HttpStatus.I_AM_A_TEAPOT,
    );
  }
}
