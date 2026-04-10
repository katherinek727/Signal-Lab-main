import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { MetricsModule } from '../metrics/metrics.module';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

@Module({
  imports: [LoggerModule, MetricsModule],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
