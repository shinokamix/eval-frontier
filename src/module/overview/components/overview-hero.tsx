import { Text } from '@/shared/components/text';

function OverviewHero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden">
      <img
        alt="Lake Geneva beneath the Alps"
        className="absolute inset-0 h-full w-full object-cover object-center grayscale"
        src="/images/overview-lake.jpg"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/15 to-black/50" />

      <div className="page-gutter relative grid w-full gap-7 pb-10 pt-36 md:pb-14">
        <Text variant="value">CODING AGENT BENCHMARKS / 2026</Text>
        <div className="max-w-5xl">
          <Text
            as="h1"
            size="hero"
            variant="title"
          >
            <span className="block whitespace-nowrap">
              {'Same\u00A0model.'}
            </span>
            <span className="block whitespace-nowrap">
              {'Different\u00A0harness.'}
            </span>
            <span className="block whitespace-nowrap">
              {'Different\u00A0result.'}
            </span>
          </Text>
        </div>
      </div>
    </section>
  );
}

export { OverviewHero };
