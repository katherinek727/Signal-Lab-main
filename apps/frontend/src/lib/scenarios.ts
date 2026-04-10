import { api } from './api';
import type { RunScenarioRequest, RunScenarioResponse, ScenarioRun } from '@/types/scenario';

export const scenariosApi = {
  run: (body: RunScenarioRequest): Promise<{ data: RunScenarioResponse }> =>
    api.post<{ data: RunScenarioResponse }>('/scenarios/run', body),

  history: (): Promise<{ data: ScenarioRun[] }> =>
    api.get<{ data: ScenarioRun[] }>('/scenarios/history'),
};
