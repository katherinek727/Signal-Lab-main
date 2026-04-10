import type { Metadata } from 'next';
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  Gauge,
  ScrollText,
} from 'lucide-react';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';
import { ObsLinkCard } from '@/components/observability/obs-link-card';
import { WalkthroughPanel } from '@/components/observability/walkthrough-panel';

export const metadata: Metadata = { title: 'Observability' };

const OBS_LINKS = [
  {
    title: 'Grafana',
    description: 'Live dashboards — scenario run counts, latency distribution, error rate, and Loki logs panel.',
    href: 'http://localhost:3100',
    icon: BarChart3,
    iconClassName: 'text-signal-warning',
    badge: ':3100',
    copyValue: 'http://localhost:3100',
    copyLabel: 'Grafana URL',
  },
  {
    title: 'Prometheus',
    description: 'Raw metrics endpoint. Query scenario_runs_total, scenario_run_duration_seconds, http_requests_total.',
    href: 'http://localhost:9090',
    icon: Gauge,
    iconClassName: 'text-signal-error',
    badge: ':9090',
    copyValue: 'scenario_runs_total',
    copyLabel: 'metric name',
  },
  {
    title: 'Loki (via Grafana Explore)',
    description: 'Structured JSON logs from the backend. Filter by scenarioType, level, or scenarioId.',
    href: 'http://localhost:3100/explore',
    icon: ScrollText,
    iconClassName: 'text-signal-success',
    badge: ':3100/explore',
    copyValue: '{app="signal-lab"} | json',
    copyLabel: 'Loki query',
  },
  {
    title: 'Backend API',
    description: 'NestJS REST API. POST /api/scenarios/run to trigger scenarios programmatically.',
    href: 'http://localhost:3001/api/health',
    icon: Activity,
    iconClassName: 'text-signal-info',
    badge: ':3001',
    copyValue: 'curl http://localhost:3001/api/health',
    copyLabel: 'health check command',
  },
  {
    title: 'Swagger Docs',
    description: 'Interactive API documentation. Try out all endpoints directly from the browser.',
    href: 'http://localhost:3001/api/docs',
    icon: FileText,
    iconClassName: 'text-primary',
    badge: ':3001/api/docs',
    copyValue: 'http://localhost:3001/api/docs',
    copyLabel: 'Swagger URL',
  },
  {
    title: 'PostgreSQL',
    description: 'All scenario runs are persisted here. Connect with the credentials from .env.example.',
    href: 'http://localhost:5432',
    icon: Database,
    iconClassName: 'text-muted-foreground',
    badge: ':5432',
    copyValue: 'postgresql://signal:signal@localhost:5432/signal_lab',
    copyLabel: 'connection string',
  },
] as const;

export default function ObservabilityPage(): React.JSX.Element {
  return (
    <PageShell>
      <div className="flex flex-col gap-10">
        <SectionHeader
          title="Observability"
          description="Every signal destination in the stack — click to open, copy queries and connection strings."
        />

        {/* ── Service links grid ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OBS_LINKS.map((link) => (
            <ObsLinkCard key={link.title} {...link} />
          ))}
        </section>

        {/* ── Loki query reference ───────────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Useful Loki Queries
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: 'All logs',              query: '{app="signal-lab"} | json' },
              { label: 'Errors only',           query: '{app="signal-lab"} | json | level="error"' },
              { label: 'By scenario type',      query: '{app="signal-lab"} | json | scenarioType="system_error"' },
              { label: 'Slow requests',         query: '{app="signal-lab"} | json | scenarioType="slow_request"' },
              { label: 'Teapot easter egg',     query: '{app="signal-lab"} | json | scenarioType="teapot"' },
              { label: 'By scenario ID',        query: '{app="signal-lab"} | json | scenarioId="<id>"' },
            ].map(({ label, query }) => (
              <LokiQueryRow key={label} label={label} query={query} />
            ))}
          </div>
        </section>

        {/* ── Verification walkthrough ───────────────────────────────────── */}
        <WalkthroughPanel />
      </div>
    </PageShell>
  );
}

// ── Inline helper (server component — no 'use client' needed) ─────────────

function LokiQueryRow({ label, query }: { label: string; query: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <code className="flex-1 truncate font-mono text-xs text-foreground">{query}</code>
    </div>
  );
}
