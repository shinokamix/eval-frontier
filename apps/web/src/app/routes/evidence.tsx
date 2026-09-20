import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function EvidencePage() {
  return (
    <main className="page-gutter pb-16 pt-36 md:pt-40">
      <div className="content-layout">
        <Text variant="title">Evidence</Text>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/evidence')({ component: EvidencePage });
