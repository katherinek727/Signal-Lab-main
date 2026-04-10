/**
 * Prisma seed — populates a handful of ScenarioRun records so the
 * run history list is non-empty on first launch.
 *
 * Run via: npm run prisma:seed  (from apps/backend)
 */
import { PrismaClient, ScenarioType, RunStatus } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_RUNS: Array<{
  type: ScenarioType;
  status: RunStatus;
  duration: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
}> = [
  { type: 'success',          status: 'completed', duration: 142,  error: null, metadata: null },
  { type: 'slow_request',     status: 'completed', duration: 3210, error: null, metadata: null },
  { type: 'validation_error', status: 'failed',    duration: 8,    error: 'Invalid scenario input', metadata: null },
  { type: 'system_error',     status: 'failed',    duration: 23,   error: 'Unhandled internal exception', metadata: null },
  { type: 'success',          status: 'completed', duration: 98,   error: null, metadata: null },
  { type: 'teapot',           status: 'completed', duration: 1,    error: null, metadata: { easter: true, signal: 42 } },
];

async function main(): Promise<void> {
  console.warn('🌱  Seeding database…');

  await prisma.scenarioRun.deleteMany();

  for (const run of SEED_RUNS) {
    await prisma.scenarioRun.create({ data: run });
  }

  console.warn(`✅  Seeded ${SEED_RUNS.length} scenario runs.`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
