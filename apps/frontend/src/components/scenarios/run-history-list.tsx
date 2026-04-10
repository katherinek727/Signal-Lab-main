'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { formatDuration, formatFull, formatRelative } from '@/lib/format';
import { queryKeys } from '@/lib/query-keys';
import { scenariosApi } from '@/lib/scenarios';
import type { ScenarioRun } from '@/types/scenario';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RunStatusBadge } from './run-status-badge';
import { ScenarioTypeBadge } from './scenario-type-badge';

// ── Skeleton row ───────────────────────────────────────────────────────────

function SkeletonRow(): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-4 w-16 ml-auto" />
      <Skeleton className="h-4 w-14" />
    </div>
  );
}

// ── History row ────────────────────────────────────────────────────────────

function HistoryRow({ run }: { run: ScenarioRun }): React.JSX.Element {
  const isTeapot = run.type === 'teapot';

  return (
    <div
      className={[
        'group flex items-center gap-4 border-b border-border/50 px-4 py-3 text-sm',
        'last:border-0 transition-colors hover:bg-secondary/30',
        isTeapot ? 'bg-signal-info/3' : '',
      ].join(' ')}
    >
      {/* Type */}
      <div className="w-36 shrink-0">
        <ScenarioTypeBadge type={run.type} />
      </div>

      {/* Status */}
      <div className="w-28 shrink-0">
        <RunStatusBadge status={run.status} />
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1 truncate text-muted-foreground">
        {run.name ?? <span className="italic opacity-50">unnamed</span>}
        {isTeapot && (
          <span className="ml-2 text-signal-info opacity-70">🫖 signal:42</span>
        )}
      </div>

      {/* Duration */}
      <div className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {formatDuration(run.duration)}
      </div>

      {/* Timestamp */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-20 shrink-0 cursor-default text-right text-xs text-muted-foreground">
            {formatRelative(run.createdAt)}
          </div>
        </TooltipTrigger>
        <TooltipContent>{formatFull(run.createdAt)}</TooltipContent>
      </Tooltip>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
      <p className="text-2xl">📭</p>
      <p className="font-medium">No runs yet</p>
      <p>Fire a scenario from the Runner to see results here.</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function RunHistoryList(): React.JSX.Element {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.scenarios.history(),
    queryFn: scenariosApi.history,
    refetchInterval: 15_000,
    select: (res) => res.data,
  });

  const runs: ScenarioRun[] = data ?? [];

  return (
    <Card className="w-full border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">
          Run History
          {runs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({runs.length})
            </span>
          )}
        </CardTitle>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label="Refresh history"
          className="h-7 w-7"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Column headers */}
        <div className="flex items-center gap-4 border-b border-border/60 bg-secondary/30 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <div className="w-36 shrink-0">Type</div>
          <div className="w-28 shrink-0">Status</div>
          <div className="flex-1">Label</div>
          <div className="w-20 shrink-0 text-right">Duration</div>
          <div className="w-20 shrink-0 text-right">When</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {runs.map((run) => (
              <HistoryRow key={run.id} run={run} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
