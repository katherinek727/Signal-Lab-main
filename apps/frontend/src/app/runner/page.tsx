import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/page-shell';
import { SectionHeader } from '@/components/layout/section-header';
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

        <div className="flex justify-center">
          <ScenarioForm />
        </div>
      </div>
    </PageShell>
  );
}
