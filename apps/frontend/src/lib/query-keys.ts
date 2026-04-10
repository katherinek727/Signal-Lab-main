/**
 * Centralised TanStack Query key factory.
 * Keeps cache invalidation consistent across the app.
 */
export const queryKeys = {
  scenarios: {
    all: ['scenarios'] as const,
    history: () => [...queryKeys.scenarios.all, 'history'] as const,
  },
} as const;
