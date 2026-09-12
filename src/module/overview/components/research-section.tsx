import { Text } from '@/shared/components/text';

const researchQuestions = [
  'Which harnesses remain efficient across models?',
  'How much can the harness change model performance?',
  'When does a small quality gain require far more resources?',
  'Does the efficient harness depend on the model?',
] as const;

function ResearchSection() {
  return (
    <section className="page-gutter flex min-h-svh flex-col justify-between gap-16 border-t border-white/15 bg-[#090909] py-10 md:py-14">
      <div className="flex items-start justify-between border-b border-white/20 pb-5">
        <Text variant="value">04 / THE RESEARCH</Text>
        <Text variant="value">COMPARABLE BLOCKS</Text>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid border-y border-white/20">
          <div className="flex items-baseline justify-between gap-5 border-b border-white/20 py-6">
            <Text
              as="p"
              variant="heading"
            >
              Model
            </Text>
            <Text variant="value">STAYS THE SAME</Text>
          </div>
          <div className="flex items-baseline justify-between gap-5 border-b border-white/20 py-6">
            <Text
              as="p"
              variant="heading"
            >
              Tasks
            </Text>
            <Text variant="value">STAY THE SAME</Text>
          </div>
          <div className="flex items-baseline justify-between gap-5 py-6">
            <Text
              as="p"
              variant="heading"
            >
              Harness
            </Text>
            <Text variant="value">CHANGES</Text>
          </div>
        </div>

        <div className="grid content-start gap-7">
          <Text
            as="h2"
            variant="heading"
          >
            What this research does
          </Text>
          <Text variant="body">
            Harness Pareto collects public experiments that keep the model and
            task set fixed while changing the harness. Each experiment becomes a
            separate comparable block.
          </Text>
          <Text variant="body">
            Within each block, we identify dominated configurations and the
            configurations that remain on the frontier.
          </Text>
        </div>
      </div>

      <div className="grid border-t border-white/20 md:grid-cols-2">
        {researchQuestions.map((question, index) => (
          <div
            className="grid min-h-36 content-between gap-8 border-b border-white/20 py-5 md:min-h-44 md:border-r md:px-5 md:odd:pl-0 md:even:border-r-0"
            key={question}
          >
            <Text variant="value">0{index + 1}</Text>
            <Text variant="body">{question}</Text>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ResearchSection };
