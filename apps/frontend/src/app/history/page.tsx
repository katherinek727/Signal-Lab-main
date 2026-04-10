import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';
import { RunHistoryList } from '@/components/scenarios/run-history-list';

export const metadata: Metadata = { title: 'History' };

export default function HistoryPage(): React.JSX.Element {
  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <SectionHeader
          title="Run History"
          description="Last 20 scenario executions, ordered by most recent. Auto-refreshes every 15 s."
        />
        <RunHistoryList />
      </div>
    </PageShell>
  );
}
