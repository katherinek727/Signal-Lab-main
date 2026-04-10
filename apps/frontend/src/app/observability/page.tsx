import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';

export const metadata: Metadata = { title: 'Observability' };

export default function ObservabilityPage(): React.JSX.Element {
  return (
    <PageShell>
      <SectionHeader
        title="Observability Links"
        description="Direct links to every signal destination in the stack."
      />
      {/* ObsLinks component added in Step 17 */}
    </PageShell>
  );
}
