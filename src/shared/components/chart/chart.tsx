import { cn } from 'cn';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useId,
} from 'react';
import { ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const initialDimension = { width: 640, height: 420 } as const;

interface ChartConfigItem {
  readonly color: string;
  readonly label: ReactNode;
}

type ChartConfig = Record<string, ChartConfigItem>;

interface ChartContainerProps extends ComponentProps<'div'> {
  readonly config: ChartConfig;
  readonly children: ComponentProps<typeof ResponsiveContainer>['children'];
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = useId();
  const chartId = `chart-${id ?? uniqueId.replaceAll(':', '')}`;

  const variables = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color]),
  ) as CSSProperties;

  return (
    <div
      className={cn(
        'flex aspect-[4/3] w-full justify-center [&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden',
        className,
      )}
      data-chart={chartId}
      data-slot="chart"
      style={variables}
      {...props}
    >
      <ResponsiveContainer initialDimension={initialDimension}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = RechartsTooltip;

export { ChartContainer, ChartTooltip, type ChartConfig };
