import { Injectable } from '@nestjs/common';

import type { RunScenarioDto } from './dto/run-scenario.dto';

/**
 * Stub implementation — full scenario execution logic is added in Step 07
 * after Prisma schema and observability wiring are in place.
 */
@Injectable()
export class ScenariosService {
  run(_dto: RunScenarioDto): Promise<{ id: string; status: string }> {
    return Promise.resolve({ id: 'stub', status: 'pending' });
  }

  history(): Promise<unknown[]> {
    return Promise.resolve([]);
  }
}
