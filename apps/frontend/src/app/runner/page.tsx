import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';
import { RunHistoryList } from '@/components/scenarios/run-history-list';
import { ScenarioForm } from '@/components/scenarios/scenario-form';

export const metadata: Metadata = { title: 'Runner' };

export default function RunnerPage(): React.JSX.Element {
  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <SectionHeader
          title="Scenario Runner"
          description="Select a scenario type and fire it. Watch the signals appear in Grafana and Sentry."
        />

        {/* Two-column layout on wider screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_1fr]">
          <ScenarioForm />
          <RunHistoryList />
        </div>
      </div>
    </PageShell>
  );
}
