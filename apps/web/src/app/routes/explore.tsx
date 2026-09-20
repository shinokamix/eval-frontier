import { createFileRoute } from '@tanstack/react-router';

import { ExploreChart } from '@/module/explore';

function ExplorePage() {
  return (
    <main>
      <ExploreChart />
    </main>
  );
}

export const Route = createFileRoute('/explore')({ component: ExplorePage });
