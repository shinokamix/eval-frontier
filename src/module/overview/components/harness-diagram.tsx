import { useId } from 'react';

import { Text } from '@/shared/components/text';

function HarnessDiagram() {
  const arrowId = useId();

  return (
    <figure
      aria-label="Context feeds the model, which requests tool actions. Tool results return to context. Execution controls model calls, and constraints restrict tools. All components are inside the harness."
      className="flex w-full flex-col gap-4 py-6"
    >
      <div className="relative border border-white/25 py-8 pl-8 pr-3 md:py-10 md:pl-12 md:pr-8">
        <div className="absolute -top-3 left-4 bg-[#090909] px-3 md:left-8">
          <Text variant="value">Harness</Text>
        </div>

        <div className="relative grid grid-cols-[42%_42%] grid-rows-[--spacing(40)_--spacing(20)_--spacing(40)] justify-between gap-y-12">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            viewBox="0 0 600 496"
            preserveAspectRatio="none"
            fill="none"
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
                  d="M2 1 L7 4 L2 7"
                  stroke="#f4f4f4"
                  strokeWidth="1"
                />
              </marker>
            </defs>
            <g
              stroke="#f4f4f4"
              strokeOpacity="0.65"
              strokeWidth="1"
              markerEnd={`url(#${arrowId})`}
            >
              <path
                d="M126 160 V208"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M126 288 V336"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0 416 H-24 V80 H0"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g
              stroke="#f4f4f4"
              strokeOpacity="0.4"
              strokeWidth="1"
              strokeDasharray="4 4"
              markerEnd={`url(#${arrowId})`}
            >
              <path
                d="M474 160 V248 H252"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M348 416 H252"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </svg>

          <div className="relative col-start-1 row-start-1 flex flex-col justify-center gap-3 border border-white/25 bg-[#090909] p-2 md:p-4">
            <Text
              variant="value"
              size="caption"
            >
              Context
            </Text>
            <div className="flex flex-col gap-1 text-white/50">
              <Text
                variant="value"
                size="caption"
              >
                system prompt
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                AGENTS.md · skills
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                history · tool results
              </Text>
            </div>
          </div>

          <div className="relative col-start-2 row-start-1 flex flex-col justify-center gap-3 border border-white/25 bg-[#090909] p-2 md:p-4">
            <Text
              variant="value"
              size="caption"
            >
              Execution
            </Text>
            <div className="flex flex-col gap-1 text-white/50">
              <Text
                variant="value"
                size="caption"
              >
                agent loop · hooks
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                compaction
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                subagents
              </Text>
            </div>
          </div>

          <div className="relative col-start-1 row-start-2 flex items-center justify-center border border-white/70 bg-[#151515]">
            <Text variant="value">Model</Text>
          </div>

          <div className="relative col-start-1 row-start-3 flex flex-col justify-center gap-3 border border-white/25 bg-[#090909] p-2 md:p-4">
            <Text
              variant="value"
              size="caption"
            >
              Tools
            </Text>
            <div className="flex flex-col gap-1 text-white/50">
              <Text
                variant="value"
                size="caption"
              >
                read · grep · fetch
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                edit · bash
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                MCP tools
              </Text>
            </div>
          </div>

          <div className="relative col-start-2 row-start-3 flex flex-col justify-center gap-3 border border-white/25 bg-[#090909] p-2 md:p-4">
            <Text
              variant="value"
              size="caption"
            >
              Constraints
            </Text>
            <div className="flex flex-col gap-1 text-white/50">
              <Text
                variant="value"
                size="caption"
              >
                sandboxes
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                permissions
              </Text>
              <Text
                variant="value"
                size="caption"
              >
                time · token limits
              </Text>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="flex flex-wrap gap-x-6 gap-y-2 text-white/50">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="w-6 border-t border-white/65"
          />
          <Text
            variant="body"
            size="caption"
          >
            Context, actions, results
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="w-6 border-t border-dashed border-white/40"
          />
          <Text
            variant="body"
            size="caption"
          >
            Execution control
          </Text>
        </div>
      </figcaption>
    </figure>
  );
}

export { HarnessDiagram };
