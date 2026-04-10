import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RunScenarioDto } from './dto/run-scenario.dto';
import { RunScenarioResponseDto, ScenarioRunDto } from './dto/scenario-run.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute a scenario',
    description:
      'Runs one of the five scenario types. Each type generates distinct ' +
      'observability signals: metrics, structured logs, and optionally Sentry events.',
  })
  @ApiResponse({ status: 200, description: 'Scenario executed', type: RunScenarioResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error scenario' })
  @ApiResponse({ status: 418, description: "I'm a teapot (easter egg)" })
  @ApiResponse({ status: 500, description: 'System error scenario' })
  run(@Body() dto: RunScenarioDto): Promise<unknown> {
    return this.scenariosService.run(dto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Retrieve last 20 scenario runs',
    description: 'Returns runs ordered by createdAt descending.',
  })
  @ApiResponse({ status: 200, description: 'Run history', type: [ScenarioRunDto] })
  history(): Promise<unknown> {
    return this.scenariosService.history();
  }
}
