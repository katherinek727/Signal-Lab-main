import { Activity, BarChart3, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Signals',
    description: 'Trigger metrics, logs, and errors with a single click.',
    color: 'text-signal-info',
    bg: 'bg-signal-info/10',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboards',
    description: 'Watch Grafana panels update in real time as you run scenarios.',
    color: 'text-signal-success',
    bg: 'bg-signal-success/10',
  },
  {
    icon: Clock,
    title: 'Full History',
    description: 'Every run is persisted with duration, status, and metadata.',
    color: 'text-signal-warning',
    bg: 'bg-signal-warning/10',
  },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <PageShell className="flex flex-col items-center gap-16 py-20">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-brand shadow-xl signal-glow">
          <Activity className="h-10 w-10 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">
            Signal <span className="gradient-text">Lab</span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            An observability playground. Press a button, watch the signal propagate through
            Prometheus, Loki, Grafana, and Sentry in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="lg">
            <Link href="/runner">Launch Runner</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/history">View History</Link>
          </Button>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
          <Card key={title} className="border-border/60">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Status strip ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        {[
          { label: 'Prometheus', port: 9090 },
          { label: 'Grafana', port: 3100 },
          { label: 'Loki', port: 3200 },
          { label: 'API Docs', port: 3001, path: '/api/docs' },
        ].map(({ label, port, path = '' }) => (
          <a
            key={label}
            href={`http://localhost:${port}${path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 transition-colors hover:border-primary/30 hover:text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal-success" />
            {label}
          </a>
        ))}
      </div>
    </PageShell>
  );
}
