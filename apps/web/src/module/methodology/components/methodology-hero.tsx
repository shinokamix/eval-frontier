import { PageHero } from '@/shared/components/page-hero';

function MethodologyHero() {
  return (
    <PageHero
      image="/images/methodology-celigny.jpg"
      alt="Céligny on the shore of Lake Geneva"
      imagePosition="52% 50%"
      label="METHODOLOGY / VERSION 1.0"
      title={
        <>
          How we compare
          <br />
          coding harnesses.
        </>
      }
    />
  );
}

export { MethodologyHero };
