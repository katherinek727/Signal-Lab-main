/**
 * Internal result type returned by each scenario handler.
 * The controller maps this to the appropriate HTTP response.
 */
export interface ScenarioResult {
  id: string;
  status: 'completed' | 'failed';
  duration: number;
  signal?: number;
  message?: string;
}
