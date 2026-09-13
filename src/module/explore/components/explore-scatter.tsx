import { useId } from 'react';

import { Text } from '@/shared/components/text';

import { type ScatterPoint } from '../types/scatter-point';

const AXIS_MAX = 105;
const TICKS = [0, 20, 40, 60, 80, 100] as const;

function position(value: number) {
  return (value / AXIS_MAX) * 100;
}

interface ExploreScatterProps {
  readonly points: readonly ScatterPoint[];
}

function ExploreScatter({ points }: ExploreScatterProps) {
  const arrowId = useId();

  if (points.length === 0) {
    return (
      <div className="grid h-full place-items-center">
        <Text variant="body">No comparable research results yet.</Text>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-72 w-full">
      <div className="absolute bottom-20 left-20 right-4 top-4 max-[480px]:left-10 md:right-20">
        <div className="absolute -left-16 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-white/60 max-[480px]:hidden">
          <Text variant="body">Relative quality</Text>
        </div>
        <div className="absolute left-1/2 top-full mt-16 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white/60 max-[480px]:hidden">
          <Text variant="body">Relative efficiency</Text>
        </div>
        <svg
          aria-label={`Scatter plot of ${points.length} harness and model configurations. Horizontal axis: relative efficiency. Vertical axis: relative quality. Both axes range from 0 to 105, with tick labels through 100.`}
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
          {TICKS.slice(1).map((tick) => (
            <g key={tick}>
              <line
                stroke="currentColor"
                className="text-white/5"
                x1={`${position(tick)}%`}
                x2={`${position(tick)}%`}
                y1="100%"
                y2="0%"
              />
              <line
                stroke="currentColor"
                className="text-white/8"
                x1="0%"
                x2="100%"
                y1={`${100 - position(tick)}%`}
                y2={`${100 - position(tick)}%`}
              />
            </g>
          ))}
          {points.map((point) => (
            <circle
              key={point.id}
              cx={`${position(point.efficiency)}%`}
              cy={`${100 - position(point.quality)}%`}
              r="4"
              fill="currentColor"
              className="text-white/75"
            />
          ))}
        </svg>
        {TICKS.map((tick) => (
          <div key={tick}>
            <div
              className="absolute top-full mt-2 -translate-x-1/2 text-white/45"
              style={{ left: `${position(tick)}%` }}
            >
              <Text
                variant="value"
                size="caption"
              >
                {tick}
              </Text>
            </div>
            <div
              className="absolute right-full mr-3 -translate-y-1/2 text-white/45"
              style={{ top: `${100 - position(tick)}%` }}
            >
              <Text
                variant="value"
                size="caption"
              >
                {tick}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ExploreScatter };
