import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent page wrapper — centres content, applies max-width and padding.
 * Use this as the outermost wrapper inside every page component.
 */
export function PageShell({ children, className }: PageShellProps): React.JSX.Element {
  return (
    <main className={cn('mx-auto w-full max-w-6xl px-6 py-8', className)}>
      {children}
    </main>
  );
}
