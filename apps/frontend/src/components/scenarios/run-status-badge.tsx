import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ScenarioRun } from '@/types/scenario';

const STATUS_CONFIG = {
  completed: {
    variant: 'success' as const,
    icon: CheckCircle2,
    label: 'Completed',
  },
  failed: {
    variant: 'destructive' as const,
    icon: XCircle,
    label: 'Failed',
  },
  pending: {
    variant: 'warning' as const,
    icon: Clock,
    label: 'Pending',
  },
} satisfies Record<ScenarioRun['status'], { variant: 'success' | 'destructive' | 'warning'; icon: React.ElementType; label: string }>;

interface RunStatusBadgeProps {
  status: ScenarioRun['status'];
}

export function RunStatusBadge({ status }: RunStatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
