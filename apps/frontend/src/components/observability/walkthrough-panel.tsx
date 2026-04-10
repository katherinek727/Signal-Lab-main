import { CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = [
  {
    n: 1,
    action: 'Start the stack',
    detail: 'docker compose up -d',
    check: 'All 7 containers healthy',
  },
  {
    n: 2,
    action: 'Open the UI',
    detail: 'http://localhost:3000',
    check: 'Signal Lab loads in browser',
  },
  {
    n: 3,
    action: 'Run "success" scenario',
    detail: 'Runner → select success → Run Scenario',
    check: 'Green badge appears in history',
  },
  {
    n: 4,
    action: 'Run "system_error" scenario',
    detail: 'Runner → select system_error → Run Scenario',
    check: 'Red badge + toast with error message',
  },
  {
    n: 5,
    action: 'Check Prometheus metrics',
    detail: 'http://localhost:3001/metrics',
    check: 'scenario_runs_total counter visible',
  },
  {
    n: 6,
    action: 'Open Grafana dashboard',
    detail: 'http://localhost:3100 → Signal Lab dashboard',
    check: 'Panels show run counts and latency',
  },
  {
    n: 7,
    action: 'Query Loki logs',
    detail: 'Grafana → Explore → Loki → {app="signal-lab"} | json',
    check: 'Structured logs with scenarioType field',
  },
  {
    n: 8,
    action: 'Verify Sentry exception',
    detail: 'Open your Sentry project dashboard',
    check: 'system_error issue with scenarioType tag',
  },
] as const;

export function WalkthroughPanel(): React.JSX.Element {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4.5 w-4.5 text-signal-success" />
          Verification Walkthrough
        </CardTitle>
        <CardDescription>
          Complete this checklist in under 5 minutes to confirm every signal is working.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y divide-border/50">
          {STEPS.map((step) => (
            <li key={step.n} className="flex items-start gap-4 px-6 py-3 hover:bg-secondary/20 transition-colors">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {step.n}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">{step.action}</p>
                <p className="font-mono text-xs text-muted-foreground">{step.detail}</p>
              </div>
              <div className="shrink-0 rounded-full border border-signal-success/30 bg-signal-success/10 px-2.5 py-0.5 text-xs text-signal-success">
                {step.check}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
