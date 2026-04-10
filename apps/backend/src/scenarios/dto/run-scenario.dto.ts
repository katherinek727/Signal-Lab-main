import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const SCENARIO_TYPES = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export class RunScenarioDto {
  @ApiProperty({
    description: 'Scenario type to execute',
    enum: SCENARIO_TYPES,
    example: 'success',
  })
  @IsIn(SCENARIO_TYPES)
  type!: ScenarioType;

  @ApiPropertyOptional({
    description: 'Optional human-readable label for this run',
    example: 'smoke test',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
