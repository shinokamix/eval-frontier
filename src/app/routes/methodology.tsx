import { createFileRoute } from '@tanstack/react-router';

import { MethodologyArticle, MethodologyHero } from '@/module/methodology';

function MethodologyPage() {
  return (
    <main>
      <MethodologyHero />
      <MethodologyArticle />
    </main>
  );
}

export const Route = createFileRoute('/methodology')({
  component: MethodologyPage,
});
