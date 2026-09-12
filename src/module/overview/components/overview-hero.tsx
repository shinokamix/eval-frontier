import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

function OverviewHero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden">
      <img
        alt="Lake Geneva beneath the Alps"
        className="absolute inset-0 h-full w-full object-cover object-center grayscale"
        src="/images/overview-lake.jpg"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/55" />

      <div className="page-gutter relative grid w-full gap-10 pb-8 pt-36 md:grid-cols-[1fr_24rem] md:items-end md:pb-12">
        <div className="grid gap-7">
          <Text variant="value">PUBLIC BENCHMARK RESEARCH / 2026</Text>
          <Text variant="title">Harness Pareto</Text>
          <div className="max-w-4xl">
            <Text
              as="p"
              variant="heading"
            >
              Same model. Different harness. Different result.
            </Text>
          </div>
        </div>

        <div className="grid gap-7 border-t border-white/35 pt-5">
          <Text variant="body">
            We study how coding-agent harnesses change model capability, cost,
            token use, and execution time.
          </Text>
          <div>
            <Link
              // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
              className="inline-block border-b border-white pb-1"
              to="/explore"
            >
              <Text variant="inline">Explore the data →</Text>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export { OverviewHero };
