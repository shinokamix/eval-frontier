import { Text } from '@/shared/components/text';

import { useResearch } from '../hooks/use-research';
import { ExploreScatter } from './explore-scatter';

function ExploreChart() {
  const { data, isLoading, isError } = useResearch();

  if (isLoading) {
    return (
      <div className="grid h-svh place-items-center">
        <Text variant="value">Loading…</Text>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid h-svh place-items-center">
        <Text variant="body">Research data could not be loaded.</Text>
      </div>
    );
  }

  return (
    <section className="page-gutter flex min-h-svh items-center justify-center pb-12 pt-28">
      <figure className="content-layout">
        <div className="h-[52svh] min-h-80 max-h-144">
          <ExploreScatter points={data} />
        </div>
      </figure>
    </section>
  );
}

export { ExploreChart };
