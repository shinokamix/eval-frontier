import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function OverviewPage() {
  return (
    <main className="page-gutter py-16">
      <Text variant="title">Overview</Text>
    </main>
  );
}

export const Route = createFileRoute('/')({ component: OverviewPage });
