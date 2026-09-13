import { createFileRoute } from '@tanstack/react-router';

import { OverviewArticle, OverviewHero } from '@/module/overview';

function OverviewPage() {
  return (
    <main>
      <OverviewHero />
      <OverviewArticle />
    </main>
  );
}

export const Route = createFileRoute('/')({ component: OverviewPage });
