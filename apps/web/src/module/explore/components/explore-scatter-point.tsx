import { Tooltip } from '@base-ui/react/tooltip';
import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';

import { revealVariants } from '@/shared/animation/reveal';
import { Text } from '@/shared/components/text';

import { type ScatterPoint } from '../types/scatter-point';

interface ExploreScatterPointProps {
  readonly point: ScatterPoint;
  readonly left: string;
  readonly top: string;
  readonly active: boolean;
  readonly dimmed: boolean;
  readonly onActiveChange: (id: string, open: boolean) => void;
}

function ExploreScatterPoint({
  point,
  left,
  top,
  active,
  dimmed,
  onActiveChange,
}: ExploreScatterPointProps) {
  const effort = point.effort ?? 'unknown effort';
  const label = `${point.harness} × ${point.model} × ${effort}`;

  return (
    <Tooltip.Root
      open={active}
      disableHoverablePopup
      onOpenChange={(open, details) => {
        // The plot handles hover by selecting the nearest point.
        if (details.reason === 'trigger-hover') {
          details.cancel();

          return;
        }

        onActiveChange(point.id, open);
      }}
    >
      <Tooltip.Trigger
        aria-label={label}
        className={cn(
          'absolute flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white/70',
          active && 'z-10',
        )}
        // oxlint-disable-next-line shadcn/no-inline-styles -- position follows the axis scale
        style={{ left, top }}
        delay={0}
        closeOnClick={false}
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-2 rounded-full bg-white transition-opacity duration-200',
            dimmed ? 'opacity-20' : active ? 'opacity-100' : 'opacity-75',
          )}
        />
      </Tooltip.Trigger>
      <AnimatePresence>
        {active && (
          <Tooltip.Portal keepMounted>
            <Tooltip.Positioner
              side="top"
              sideOffset={10}
              collisionPadding={16}
              className="z-50"
            >
              <Tooltip.Popup
                render={
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={revealVariants}
                  />
                }
                className="min-w-52 max-w-[calc(100vw-2rem)] border border-white/10 bg-overlay p-3 shadow-lg"
              >
                <Text
                  as="div"
                  variant="value"
                  size="caption"
                  className="break-words"
                >
                  {label}
                </Text>
                <dl className="mt-3 grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1">
                  <Text
                    as="dt"
                    variant="inline"
                    size="caption"
                    tone="subtle"
                  >
                    Efficiency
                  </Text>
                  <Text
                    as="dd"
                    variant="value"
                    size="caption"
                  >
                    {point.efficiency.toFixed(1)}
                  </Text>
                  <Text
                    as="dt"
                    variant="inline"
                    size="caption"
                    tone="subtle"
                  >
                    Quality
                  </Text>
                  <Text
                    as="dd"
                    variant="value"
                    size="caption"
                  >
                    {point.quality.toFixed(1)}
                  </Text>
                </dl>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        )}
      </AnimatePresence>
    </Tooltip.Root>
  );
}

export { ExploreScatterPoint };
