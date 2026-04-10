import { Module } from '@nestjs/common';

import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

/**
 * Exports shared interceptors so they can be referenced in tests
 * without re-importing from deep paths.
 */
@Module({
  providers: [LoggingInterceptor, ResponseTransformInterceptor],
  exports: [LoggingInterceptor, ResponseTransformInterceptor],
})
export class CommonModule {}
