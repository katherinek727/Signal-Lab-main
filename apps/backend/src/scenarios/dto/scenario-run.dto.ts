import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { ScenarioType } from './run-scenario.dto';

export class ScenarioRunDto {
  @ApiProperty({ example: 'clxyz123' })
  id!: string;

  @ApiProperty({ enum: ['success', 'validation_error', 'system_error', 'slow_request', 'teapot'] })
  type!: ScenarioType;

  @ApiPropertyOptional({ example: 'smoke test' })
  name?: string | null;

  @ApiProperty({ enum: ['pending', 'completed', 'failed'] })
  status!: string;

  @ApiPropertyOptional({ example: 142, description: 'Execution time in milliseconds' })
  duration?: number | null;

  @ApiPropertyOptional({ example: 'Unhandled exception' })
  error?: string | null;

  @ApiPropertyOptional({ example: { easter: true } })
  metadata?: Record<string, unknown> | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class RunScenarioResponseDto {
  @ApiProperty({ example: 'clxyz123' })
  id!: string;

  @ApiProperty({ enum: ['pending', 'completed', 'failed'] })
  status!: string;

  @ApiPropertyOptional({ example: 142 })
  duration?: number;

  // Teapot easter egg fields
  @ApiPropertyOptional({ example: 42 })
  signal?: number;

  @ApiPropertyOptional({ example: "I'm a teapot" })
  message?: string;
}
