import { Text } from '@/shared/components/text';

function TradeoffSection() {
  return (
    <section className="page-gutter flex min-h-svh flex-col justify-between gap-14 border-t border-white/15 bg-[#090909] py-10 md:py-14">
      <div className="flex items-start justify-between border-b border-white/20 pb-5">
        <Text variant="value">02 / THE TRADE-OFF</Text>
        <Text variant="value">WHICH IS BETTER?</Text>
      </div>

      <div className="grid border-y border-white/20 md:grid-cols-2">
        <div className="grid min-h-64 content-between gap-12 border-b border-white/20 py-7 md:min-h-96 md:border-r md:border-b-0 md:pr-10">
          <Text variant="value">CONFIGURATION A</Text>
          <div>
            <Text
              as="p"
              variant="title"
            >
              82%
            </Text>
            <Text variant="body">of tasks solved, at twice the cost</Text>
          </div>
        </div>
        <div className="grid min-h-64 content-between gap-12 py-7 md:min-h-96 md:pl-10">
          <Text variant="value">CONFIGURATION B</Text>
          <div>
            <Text
              as="p"
              variant="title"
            >
              79%
            </Text>
            <Text variant="body">of tasks solved, with half the tokens</Text>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-end">
        <Text
          as="h2"
          variant="heading"
        >
          There may be no single best configuration.
        </Text>
        <div className="grid gap-5">
          <Text variant="body">
            Higher benchmark performance can require more tokens, more time, or
            more money. Looking only at the final score hides that exchange.
          </Text>
          <Text variant="body">
            The better choice depends on what you are optimizing for.
          </Text>
        </div>
      </div>
    </section>
  );
}

export { TradeoffSection };
