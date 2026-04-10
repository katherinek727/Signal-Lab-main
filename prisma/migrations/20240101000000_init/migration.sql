-- CreateEnum
CREATE TYPE "ScenarioType" AS ENUM (
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot'
);

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM (
  'pending',
  'completed',
  'failed'
);

-- CreateTable
CREATE TABLE "scenario_runs" (
  "id"         TEXT         NOT NULL,
  "type"       "ScenarioType" NOT NULL,
  "name"       VARCHAR(120),
  "status"     "RunStatus"  NOT NULL DEFAULT 'pending',
  "duration"   INTEGER,
  "error"      TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "scenario_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scenario_runs_type_idx"      ON "scenario_runs"("type");
CREATE INDEX "scenario_runs_status_idx"    ON "scenario_runs"("status");
CREATE INDEX "scenario_runs_createdAt_idx" ON "scenario_runs"("createdAt" DESC);
