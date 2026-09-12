import { createFileRoute } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function MethodologyPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Text variant="title">Methodology</Text>
    </main>
  );
}

export const Route = createFileRoute('/methodology')({
  component: MethodologyPage,
});
