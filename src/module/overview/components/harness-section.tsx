import { Text } from '@/shared/components/text';

const harnessActions = [
  'READS FILES',
  'EDITS CODE',
  'RUNS COMMANDS',
  'MANAGES CONTEXT',
  'RETRIES FAILURES',
  'SPENDS TOKENS',
] as const;

function HarnessSection() {
  return (
    <section className="page-gutter flex min-h-svh flex-col justify-between gap-16 border-t border-white/15 bg-[#090909] py-10 md:py-14">
      <div className="flex items-start justify-between border-b border-white/20 pb-5">
        <Text variant="value">01 / THE SYSTEM</Text>
        <Text variant="value">THE HARNESS MATTERS</Text>
      </div>

      <div className="grid gap-12 md:grid-cols-[1.35fr_0.65fr] md:items-end">
        <div className="max-w-5xl">
          <Text
            as="h2"
            variant="title"
          >
            The model is only part of the system.
          </Text>
        </div>
        <div className="grid gap-6 border-t border-white/20 pt-5">
          <Text variant="body">
            A benchmark result is not produced by the model alone. The harness
            decides how the model interacts with a repository and how much work
            it can do before the run ends.
          </Text>
          <Text variant="body">
            The same model can produce different results in Pi, Codex, Claude
            Code, OpenCode, Oh My Pi, or another harness.
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-white/20 md:grid-cols-3 xl:grid-cols-6">
        {harnessActions.map((action) => (
          <div
            className="border-white/15 px-3 py-5 odd:border-r md:border-r md:last:border-r-0"
            key={action}
          >
            <Text variant="value">{action}</Text>
          </div>
        ))}
      </div>
    </section>
  );
}

export { HarnessSection };
