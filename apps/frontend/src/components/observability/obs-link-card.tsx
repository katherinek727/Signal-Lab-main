'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ObsLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconClassName?: string;
  badge?: string;
  copyValue?: string;
  copyLabel?: string;
  children?: React.ReactNode;
}

export function ObsLinkCard({
  title,
  description,
  href,
  icon: Icon,
  iconClassName = 'text-primary',
  badge,
  copyValue,
  copyLabel,
  children,
}: ObsLinkCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group border-border/60 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-secondary', iconClassName.replace('text-', 'bg-').replace(/text-\S+/, '') + ' bg-opacity-10')}>
              <Icon className={cn('h-4.5 w-4.5', iconClassName)} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {badge && (
                <span className="mt-0.5 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {badge}
                </span>
              )}
            </div>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardHeader>

      {(copyValue || children) && (
        <CardContent className="space-y-3 pt-0">
          {copyValue && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2">
              <code className="flex-1 truncate font-mono text-xs text-foreground">
                {copyValue}
              </code>
              <button
                onClick={() => void handleCopy()}
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Copy ${copyLabel ?? 'value'}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-signal-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  );
}
