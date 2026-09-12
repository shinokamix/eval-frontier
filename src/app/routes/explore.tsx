import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function ExplorePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Text variant="title">Explore</Text>
    </main>
  );
}

export const Route = createFileRoute('/explore')({ component: ExplorePage });
