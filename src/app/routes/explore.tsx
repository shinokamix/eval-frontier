import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function ExplorePage() {
  return (
    <main className="page-gutter py-16">
      <Text variant="title">Explore</Text>
    </main>
  );
}

export const Route = createFileRoute('/explore')({ component: ExplorePage });
