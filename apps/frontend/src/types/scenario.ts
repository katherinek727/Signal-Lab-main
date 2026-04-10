export const SCENARIO_TYPES = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export interface ScenarioRun {
  id: string;
  type: ScenarioType;
  status: 'completed' | 'failed' | 'pending';
  duration: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunScenarioRequest {
  type: ScenarioType;
  name?: string;
}

export interface RunScenarioResponse {
  id: string;
  status: string;
  duration?: number;
  signal?: number;
  message?: string;
}
