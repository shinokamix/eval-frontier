import { createFileRoute } from '@tanstack/react-router';

import { OverviewArticle } from '@/module/overview/components/overview-article';
import { OverviewHero } from '@/module/overview/components/overview-hero';

function OverviewPage() {
  return (
    <main>
      <OverviewHero />
      <OverviewArticle />
    </main>
  );
}

export const Route = createFileRoute('/')({ component: OverviewPage });
