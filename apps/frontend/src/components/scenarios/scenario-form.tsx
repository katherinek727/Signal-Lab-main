'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Loader2,
  Play,
  Timer,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { queryKeys } from '@/lib/query-keys';
import { scenariosApi } from '@/lib/scenarios';
import type { RunScenarioResponse, ScenarioType } from '@/types/scenario';
import { SCENARIO_TYPES } from '@/types/scenario';
import { ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ── Schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(SCENARIO_TYPES, { required_error: 'Select a scenario type' }),
  name: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Scenario metadata ──────────────────────────────────────────────────────

const SCENARIO_META: Record<
  ScenarioType,
  { label: string; description: string; icon: React.ElementType; badge: string }
> = {
  success: {
    label: 'Success',
    description: 'Completes normally. Emits an info log and increments the success counter.',
    icon: CheckCircle2,
    badge: 'success',
  },
  validation_error: {
    label: 'Validation Error',
    description: 'Returns HTTP 400. Emits a warn log and increments the error counter.',
    icon: AlertTriangle,
    badge: 'warning',
  },
  system_error: {
    label: 'System Error',
    description: 'Throws an unhandled exception. Captured by Sentry. HTTP 500.',
    icon: XCircle,
    badge: 'destructive',
  },
  slow_request: {
    label: 'Slow Request',
    description: 'Adds a 2–5 s artificial delay. Creates a histogram spike in Grafana.',
    icon: Timer,
    badge: 'warning',
  },
  teapot: {
    label: '🫖 Teapot',
    description: 'Returns HTTP 418. Stores metadata: { easter: true, signal: 42 }.',
    icon: Coffee,
    badge: 'info',
  },
};

// ── Result panel ───────────────────────────────────────────────────────────

interface ResultPanelProps {
  result: RunScenarioResponse | null;
  error: ApiError | Error | null;
  type: ScenarioType | null;
}

function ResultPanel({ result, error, type }: ResultPanelProps): React.JSX.Element | null {
  if (!result && !error) return null;

  const isTeapot = result?.signal === 42;
  const isError = !!error;

  return (
    <div
      className={[
        'rounded-xl border p-4 text-sm font-mono animate-slide-up',
        isTeapot
          ? 'border-signal-info/30 bg-signal-info/5 text-signal-info'
          : isError
            ? 'border-destructive/30 bg-destructive/5 text-destructive'
            : 'border-signal-success/30 bg-signal-success/5 text-signal-success',
      ].join(' ')}
    >
      {isTeapot && result ? (
        <div className="space-y-1">
          <p className="font-semibold not-italic">HTTP 418 — I&apos;m a teapot 🫖</p>
          <p className="opacity-80">signal: {result.signal}</p>
          <p className="opacity-80">message: &quot;{result.message}&quot;</p>
          <p className="opacity-80">id: {result.id}</p>
        </div>
      ) : isError ? (
        <div className="space-y-1">
          <p className="font-semibold not-italic">
            {type === 'system_error' ? 'HTTP 500 — System Error (check Sentry)' : 'HTTP 400 — Validation Error'}
          </p>
          <p className="opacity-80">{error.message}</p>
        </div>
      ) : result ? (
        <div className="space-y-1">
          <p className="font-semibold not-italic">HTTP 200 — Completed</p>
          <p className="opacity-80">id: {result.id}</p>
          {result.duration !== undefined && (
            <p className="opacity-80">duration: {result.duration} ms</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ScenarioForm(): React.JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<RunScenarioResponse | null>(null);
  const [lastError, setLastError] = useState<ApiError | Error | null>(null);
  const [lastType, setLastType] = useState<ScenarioType | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedType = watch('type') as ScenarioType | undefined;
  const meta = selectedType ? SCENARIO_META[selectedType] : null;

  const mutation = useMutation({
    mutationFn: scenariosApi.run,
    onSuccess: (response) => {
      const data = response.data;
      setLastResult(data);
      setLastError(null);

      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.history() });

      if (data.signal === 42) {
        toast({ title: "I'm a teapot 🫖", description: `signal: ${data.signal}`, variant: 'default' });
      } else {
        toast({ title: 'Scenario completed', description: `ID: ${data.id}`, variant: 'default' });
      }
    },
    onError: (err: unknown) => {
      const apiErr = err instanceof ApiError ? err : new Error(String(err));
      setLastError(apiErr);
      setLastResult(null);

      const isExpected =
        selectedType === 'validation_error' || selectedType === 'system_error' || selectedType === 'teapot';

      toast({
        title: isExpected ? 'Expected error signal fired' : 'Unexpected error',
        description: apiErr.message,
        variant: isExpected ? 'default' : 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues): void => {
    setLastType(values.type);
    mutation.mutate({ type: values.type, name: values.name || undefined });
  };

  return (
    <Card className="w-full max-w-xl border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Run a Scenario
        </CardTitle>
        <CardDescription>
          Each scenario type generates distinct observability signals across the stack.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* ── Type select ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="type">Scenario type</Label>
            <Select
              onValueChange={(v) => setValue('type', v as ScenarioType, { shouldValidate: true })}
            >
              <SelectTrigger id="type" className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a scenario…" />
              </SelectTrigger>
              <SelectContent>
                {SCENARIO_TYPES.map((t) => {
                  const m = SCENARIO_META[t];
                  const Icon = m.icon;
                  return (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {m.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* ── Scenario description ─────────────────────────────────────── */}
          {meta && (
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3 text-sm animate-slide-up">
              <meta.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{meta.label}</span>
                  <Badge variant={meta.badge as 'success' | 'warning' | 'destructive' | 'info'}>
                    {meta.badge}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{meta.description}</p>
              </div>
            </div>
          )}

          {/* ── Optional name ────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Label{' '}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. smoke test"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <Separator />

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Scenario
              </>
            )}
          </Button>
        </form>

        {/* ── Result panel ─────────────────────────────────────────────── */}
        <ResultPanel
          result={lastResult}
          error={lastError}
          type={lastType}
        />
      </CardContent>
    </Card>
  );
}
