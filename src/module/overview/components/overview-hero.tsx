import { PageHero } from '@/shared/components/page-hero';

function OverviewHero() {
  return (
    <PageHero
      image="/images/overview-lake.jpg"
      alt="Lake Geneva beneath the Alps"
      label="CODING AGENT BENCHMARKS / 2026"
      title={
        <>
          <span className="block whitespace-nowrap">{'Same\u00A0model.'}</span>
          <span className="block whitespace-nowrap">
            {'Different\u00A0harness.'}
          </span>
          <span className="block whitespace-nowrap">
            {'Different\u00A0result.'}
          </span>
        </>
      }
    />
  );
}

export { OverviewHero };
