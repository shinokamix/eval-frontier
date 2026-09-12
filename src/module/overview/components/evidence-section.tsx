import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

const evidenceStats = [
  { label: 'MODELS', value: '15' },
  { label: 'HARNESSES', value: '17' },
  { label: 'COMPARABLE EXPERIMENTS', value: '12' },
  { label: 'PUBLIC SOURCES', value: '11' },
] as const;

function EvidenceSection() {
  return (
    <section className="page-gutter flex min-h-svh flex-col justify-between gap-16 border-t border-white/15 bg-[#090909] py-10 md:py-14">
      <div className="flex items-start justify-between border-b border-white/20 pb-5">
        <Text variant="value">05 / THE EVIDENCE</Text>
        <Text variant="value">OPEN SOURCES</Text>
      </div>

      <div className="grid gap-12 md:grid-cols-2 md:items-end">
        <Text
          as="h2"
          variant="title"
        >
          Built from public evidence.
        </Text>
        <div className="grid gap-6 border-t border-white/20 pt-5">
          <Text variant="body">
            Harness Pareto does not create a closed leaderboard. Every result
            comes from a published benchmark or experiment and points back to
            its original source.
          </Text>
          <Text variant="body">
            Inspect the evidence, compare configurations, and decide which
            trade-offs fit your constraints.
          </Text>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-y border-white/20 lg:grid-cols-4">
        {evidenceStats.map((stat) => (
          <div
            className="grid min-h-40 content-between border-white/20 px-3 py-5 odd:border-r lg:min-h-56 lg:border-r lg:last:border-r-0"
            key={stat.label}
          >
            <dt>
              <Text variant="value">{stat.label}</Text>
            </dt>
            <dd>
              <Text
                as="span"
                variant="title"
              >
                {stat.value}
              </Text>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-x-10 gap-y-5">
        <Link
          // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
          className="border-b border-white pb-1"
          to="/explore"
        >
          <Text variant="inline">Explore the data →</Text>
        </Link>
        <Link
          // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
          className="border-b border-white/40 pb-1 text-white/70"
          to="/evidence"
        >
          <Text variant="inline">View the evidence →</Text>
        </Link>
        <Link
          // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
          className="border-b border-white/40 pb-1 text-white/70"
          to="/methodology"
        >
          <Text variant="inline">Read the methodology →</Text>
        </Link>
      </div>
    </section>
  );
}

export { EvidenceSection };
