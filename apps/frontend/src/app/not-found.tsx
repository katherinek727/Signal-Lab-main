import Link from 'next/link';

import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';

export default function NotFound(): React.JSX.Element {
  return (
    <PageShell className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="text-8xl font-bold gradient-text select-none">404</p>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </PageShell>
  );
}
