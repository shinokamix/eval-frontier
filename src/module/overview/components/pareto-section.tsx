import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';

import { ParetoExample } from './pareto-example';

function ParetoSection() {
  return (
    <section className="page-gutter min-h-svh border-t border-white/15 bg-[#090909] py-10 md:py-14">
      <div className="flex items-start justify-between border-b border-white/20 pb-5">
        <Text variant="value">03 / THE FRONTIER</Text>
        <Text variant="value">QUALITY ↑ / RESOURCES ↓</Text>
      </div>

      <div className="grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <Text
          as="h2"
          variant="title"
        >
          What is Pareto efficiency?
        </Text>
        <div className="grid content-start gap-6 md:pt-2">
          <Text variant="body">
            A configuration is{' '}
            <Tooltip>
              <TooltipTrigger
                // oxlint-disable-next-line react/forbid-component-props -- Base UI renders the focusable button.
                className="cursor-help border-b border-dotted border-current"
              >
                <Text variant="inline">Pareto-efficient</Text>
              </TooltipTrigger>
              <TooltipContent>
                <Text variant="body">
                  No alternative is at least as good on every measured metric
                  and better on one.
                </Text>
              </TooltipContent>
            </Tooltip>{' '}
            when no other configuration is better or equal across every metric
            and strictly better on at least one.
          </Text>
          <Text variant="body">
            The configurations that remain form the Pareto frontier. The
            frontier shows the best available trade-offs instead of forcing
            every result into one ranking.
          </Text>
        </div>
      </div>

      <ParetoExample />

      <div className="mt-12 flex justify-end">
        <Link
          // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
          className="border-b border-white/50 pb-1"
          to="/methodology"
        >
          <Text variant="inline">Learn about the methodology →</Text>
        </Link>
      </div>
    </section>
  );
}

export { ParetoSection };
