import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function EvidencePage() {
  return (
    <main className="page-gutter py-16">
      <Text variant="title">Evidence</Text>
    </main>
  );
}

export const Route = createFileRoute('/evidence')({ component: EvidencePage });
