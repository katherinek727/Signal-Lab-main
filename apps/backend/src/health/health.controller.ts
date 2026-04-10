import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness + readiness check' })
  @ApiResponse({
    status: 200,
    description: 'All indicators healthy',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'One or more indicators degraded' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
    ]);
  }
}
