import { useId } from 'react';

import { Text } from '@/shared/components/text';

import { useResearch } from '../hooks/use-research';

// Maps values onto 0–100 along an axis, with padding at both ends.
function axis(values: readonly number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min || 1) * 0.1;

  return (value: number) => ((value - min + pad) / (max - min + 2 * pad)) * 100;
}

function ExploreChart() {
  const arrowId = useId();
  const points = useResearch()?.points ?? [];
  const x = axis(points.map((point) => Math.log2(point.relativeCost)));
  const y = axis(points.map((point) => point.qualityDifference));

  return (
    <section className="page-gutter flex min-h-svh items-center justify-center pb-12 pt-28">
      <figure className="content-layout">
        <div className="relative h-[52svh] min-h-80 max-h-144 w-full">
          <div className="absolute bottom-20 left-20 right-4 top-4 max-[480px]:left-10 md:right-20">
            <div className="absolute -left-16 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-white/60 max-[480px]:hidden">
              <Text variant="body">Quality difference, pp</Text>
            </div>
            <div className="absolute left-1/2 top-full mt-16 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white/60 max-[480px]:hidden">
              <Text variant="body">Relative cost, log scale</Text>
            </div>
            <svg
              aria-label="Quality difference against relative cost"
              className="absolute inset-0 size-full overflow-visible"
            >
              <defs>
                <marker
                  id={arrowId}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path
                    d="M 1 1 L 7 4 L 1 7"
                    fill="none"
                    stroke="context-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              </defs>
              <g
                stroke="currentColor"
                className="text-white/30"
                markerEnd={`url(#${arrowId})`}
              >
                <line
                  x1="0%"
                  x2="0%"
                  y1="100%"
                  y2="0%"
                />
                <line
                  x1="0%"
                  x2="100%"
                  y1="100%"
                  y2="100%"
                />
              </g>
              {points.map((point) => (
                <circle
                  key={point.id}
                  cx={`${x(Math.log2(point.relativeCost))}%`}
                  cy={`${100 - y(point.qualityDifference)}%`}
                  r="4"
                  className="fill-white/75"
                >
                  <title>{point.label}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>
      </figure>
    </section>
  );
}

export { ExploreChart };
