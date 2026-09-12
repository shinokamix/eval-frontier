import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/shared/components/chart';
import { Text } from '@/shared/components/text';

const chartConfig = {
  dominated: { color: '#696969', label: 'Dominated' },
  frontier: { color: '#f4f4f4', label: 'Pareto frontier' },
} satisfies ChartConfig;

interface ChartPoint {
  readonly cost: number;
  readonly harness: string;
  readonly note: string;
  readonly quality: number;
}

const frontierPoints: readonly ChartPoint[] = [
  { cost: 2, harness: 'A', note: 'Lowest cost', quality: 80 },
  { cost: 4, harness: 'B', note: 'Middle trade-off', quality: 85 },
  { cost: 9, harness: 'C', note: 'Highest quality', quality: 90 },
];

const dominatedPoints: readonly ChartPoint[] = [
  { cost: 5, harness: 'D', note: 'Dominated by A', quality: 78 },
];

const examplePoints = [...frontierPoints, ...dominatedPoints];

const chartMargin = { bottom: 10, left: 4, right: 12, top: 18 } as const;
const maximumCost = 10;
const minimumQuality = 74;
const maximumQuality = 94;
const costDomain = [0, maximumCost] as const;
const qualityDomain = [minimumQuality, maximumQuality] as const;
const tooltipCursor = { stroke: 'rgba(255,255,255,0.25)' } as const;

const frontierLine = {
  stroke: 'var(--color-frontier)',
  strokeWidth: 1.5,
} as const;

function isChartPoint(value: unknown): value is ChartPoint {
  return (
    typeof value === 'object'
    && value !== null
    && 'cost' in value
    && typeof value.cost === 'number'
    && 'harness' in value
    && typeof value.harness === 'string'
    && 'note' in value
    && typeof value.note === 'string'
    && 'quality' in value
    && typeof value.quality === 'number'
  );
}

function renderParetoTooltip(props: TooltipContentProps) {
  const payload: unknown = props.payload[0]?.payload;

  if (!props.active || !isChartPoint(payload)) {
    return null;
  }

  const point = payload;

  return (
    <div className="grid min-w-44 gap-2 rounded-sm border border-white/15 bg-[#171717] px-3 py-3 shadow-xl">
      <div className="flex items-center justify-between gap-6">
        <Text variant="value">HARNESS {point.harness}</Text>
        <Text variant="value">{point.quality}%</Text>
      </div>
      <Text variant="body">{point.note}</Text>
      <Text variant="value">COST ${point.cost}</Text>
    </div>
  );
}

function ParetoExample() {
  return (
    <figure className="border-y border-white/15 py-5 md:py-8">
      <div className="mb-3 flex items-start justify-between gap-4">
        <Text variant="value">ILLUSTRATIVE EXAMPLE</Text>
        <Text variant="value">HIGHER QUALITY ↑</Text>
      </div>

      <div className="relative">
        {/* The copied chart component accepts layout classes at its boundary. */}
        <ChartContainer
          aria-label="Illustrative chart comparing harness quality and cost"
          // oxlint-disable-next-line react/forbid-component-props
          className="min-h-72 max-h-[34rem]"
          config={chartConfig}
        >
          <ScatterChart margin={chartMargin}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="2 7"
            />
            <XAxis
              axisLine={false}
              dataKey="cost"
              domain={costDomain}
              tick={false}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="quality"
              domain={qualityDomain}
              tick={false}
              tickLine={false}
              type="number"
            />
            <ChartTooltip
              content={renderParetoTooltip}
              cursor={tooltipCursor}
            />
            <Scatter
              data={frontierPoints}
              fill="var(--color-frontier)"
              line={frontierLine}
              lineType="joint"
              name="Pareto frontier"
            />
            <Scatter
              data={dominatedPoints}
              fill="var(--color-dominated)"
              name="Dominated"
            />
          </ScatterChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between">
          <Text variant="value">LOWER COST</Text>
          <Text variant="value">HIGHER COST</Text>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 border-y border-white/15 md:grid-cols-4">
        {examplePoints.map((point) => (
          <div
            className="flex items-center gap-3 border-white/15 px-3 py-4 odd:border-r md:border-r md:last:border-r-0"
            key={point.harness}
          >
            <span
              aria-hidden="true"
              className={
                point.harness === 'D'
                  ? 'size-2 shrink-0 rounded-full bg-[#696969]'
                  : 'size-2 shrink-0 rounded-full bg-[#f4f4f4]'
              }
            />
            <Text variant="value">
              {point.harness} / ${point.cost} / {point.quality}%
            </Text>
          </div>
        ))}
      </div>

      <figcaption className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-full bg-[#f4f4f4]"
          />
          <Text variant="body">
            A, B, and C form the frontier. Each improves quality by accepting a
            higher cost.
          </Text>
        </div>
        <div className="flex items-start gap-3 text-white/55">
          <span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-full bg-[#696969]"
          />
          <Text variant="body">
            D is outside the frontier. A has higher quality and lower cost.
          </Text>
        </div>
      </figcaption>
    </figure>
  );
}

export { ParetoExample };
