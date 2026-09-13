import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function ExplorePage() {
  return (
    <main className="page-gutter pb-16 pt-36 md:pt-40">
      <div className="content-layout">
        <Text variant="title">Explore</Text>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/explore')({ component: ExplorePage });
