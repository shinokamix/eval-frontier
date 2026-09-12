import { createFileRoute } from '@tanstack/react-router';

import { EvidenceSection } from '@/module/overview/components/evidence-section';
import { HarnessSection } from '@/module/overview/components/harness-section';
import { OverviewHero } from '@/module/overview/components/overview-hero';
import { ParetoSection } from '@/module/overview/components/pareto-section';
import { ResearchSection } from '@/module/overview/components/research-section';
import { TradeoffSection } from '@/module/overview/components/tradeoff-section';
import { TooltipProvider } from '@/shared/components/tooltip';

function OverviewPage() {
  return (
    <TooltipProvider delay={250}>
      <main>
        <OverviewHero />
        <HarnessSection />
        <TradeoffSection />
        <ParetoSection />
        <ResearchSection />
        <EvidenceSection />
      </main>
    </TooltipProvider>
  );
}

export const Route = createFileRoute('/')({ component: OverviewPage });
