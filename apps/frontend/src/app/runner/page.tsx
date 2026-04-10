import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';

export const metadata: Metadata = { title: 'Runner' };

export default function RunnerPage(): React.JSX.Element {
  return (
    <PageShell>
      <SectionHeader
        title="Scenario Runner"
        description="Select a scenario type and fire it. Watch the signals appear in Grafana and Sentry."
      />
      {/* ScenarioForm component added in Step 09 */}
    </PageShell>
  );
}
