import {
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Timer,
  XCircle,
} from 'lucide-react';

import type { ScenarioType } from '@/types/scenario';

const TYPE_CONFIG: Record<
  ScenarioType,
  { icon: React.ElementType; label: string; className: string }
> = {
  success: {
    icon: CheckCircle2,
    label: 'success',
    className: 'text-signal-success',
  },
  validation_error: {
    icon: AlertTriangle,
    label: 'validation_error',
    className: 'text-signal-warning',
  },
  system_error: {
    icon: XCircle,
    label: 'system_error',
    className: 'text-signal-error',
  },
  slow_request: {
    icon: Timer,
    label: 'slow_request',
    className: 'text-signal-warning',
  },
  teapot: {
    icon: Coffee,
    label: 'teapot',
    className: 'text-signal-info',
  },
};

interface ScenarioTypeBadgeProps {
  type: ScenarioType;
}

export function ScenarioTypeBadge({ type }: ScenarioTypeBadgeProps): React.JSX.Element {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${config.className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  );
}
