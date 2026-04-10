import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';

export const metadata: Metadata = { title: 'History' };

export default function HistoryPage(): React.JSX.Element {
  return (
    <PageShell>
      <SectionHeader
        title="Run History"
        description="Last 20 scenario executions, ordered by most recent."
      />
      {/* RunHistoryList component added in Step 10 */}
    </PageShell>
  );
}
