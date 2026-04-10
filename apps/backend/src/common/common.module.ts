import { Module } from '@nestjs/common';

import { MetricsModule } from '../metrics/metrics.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

@Module({
  imports: [MetricsModule],
  providers: [LoggingInterceptor, ResponseTransformInterceptor],
  exports: [LoggingInterceptor, ResponseTransformInterceptor],
})
export class CommonModule {}
