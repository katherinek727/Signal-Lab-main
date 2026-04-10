'use client';

import { Activity, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Runner' },
  { href: '/history', label: 'History' },
  { href: '/observability', label: 'Observability' },
] as const;

export function NavBar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-sm transition-transform group-hover:scale-105">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">
            Signal <span className="gradient-text">Lab</span>
          </span>
        </Link>

        {/* ── Nav links ─────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            API Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
