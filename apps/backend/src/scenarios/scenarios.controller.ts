import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenariosService } from './scenarios.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @ApiOperation({ summary: 'Execute a scenario' })
  run(@Body() dto: RunScenarioDto): Promise<unknown> {
    return this.scenariosService.run(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Retrieve last 20 scenario runs' })
  history(): Promise<unknown> {
    return this.scenariosService.history();
  }
}
