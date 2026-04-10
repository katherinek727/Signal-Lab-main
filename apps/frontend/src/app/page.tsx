import { Activity } from 'lucide-react';

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 text-center animate-slide-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand shadow-lg signal-glow">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Signal Lab</h1>
        <p className="max-w-md text-muted-foreground">
          Observability playground — generate real metrics, logs and errors on demand.
        </p>
      </div>

      {/* ── Status pill ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm">
        <span className="h-2 w-2 rounded-full bg-signal-success animate-pulse-ring" />
        <span className="text-muted-foreground">
          Backend wiring in progress — full UI coming in Step 09
        </span>
      </div>
    </main>
  );
}
