import { Article } from '@/shared/components/article';
import { ArticleSection } from '@/shared/components/article-section';
import { Text } from '@/shared/components/text';

import { ArticleLink } from './article-link';
import { ComparisonTable } from './comparison-table';

const evidenceStats = [
  { label: 'MODELS', value: '15' },
  { label: 'HARNESSES', value: '17' },
  { label: 'COMPARISONS', value: '12' },
  { label: 'SOURCES', value: '11' },
] as const;

function OverviewArticle() {
  return (
    <Article>
      <ArticleSection>
        <Text
          as="h2"
          variant="heading"
        >
          Why the same coding model gets different benchmark results
        </Text>
        <Text variant="body">
          A coding model does not work on a repository by itself. It needs an
          agent app that reads files, edits code, and runs commands. We call
          that app a harness.
        </Text>
        <Text variant="body">
          Pi, Codex, Claude Code, OpenCode, and Oh My Pi are harnesses. Give
          them the same model and the same task, and they can still produce
          different results.
        </Text>
        <Text variant="body">
          This site collects published benchmark results and compares runs that
          use the same model and tasks. When a source provides the numbers, you
          can compare tasks solved, token use, cost, and runtime.
        </Text>
        <div>
          <ArticleLink to="/explore">Explore the results →</ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text
          as="h2"
          variant="heading"
        >
          We compare runs under the same conditions
        </Text>
        <Text variant="body">
          A comparison uses one model and one task set. The harness is the only
          part that changes.
        </Text>
        <Text variant="body">
          If two runs use different models or tasks, they go into separate
          groups. Their scores are not compared directly.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text
          as="h2"
          variant="heading"
        >
          The highest score is not always the best choice
        </Text>
        <Text variant="body">
          Setup A solves 82% of tasks and costs $2 per task. Setup B solves 79%
          and costs $1. Choose A to solve more tasks. Choose B to spend less.
          Neither setup is better on both measures.
        </Text>

        <ComparisonTable />

        <Text variant="body">
          Setup C solves fewer tasks than Setup B and costs more. There is no
          reason to choose C, so we remove it from the useful results.
        </Text>
        <Text variant="body">
          Setups A and B both stay. Each is the better choice for a different
          reason. This lets you pick a result based on what matters to you
          instead of following one ranking.
        </Text>
        <div>
          <ArticleLink to="/methodology">
            Read how comparisons work →
          </ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text
          as="h2"
          variant="heading"
        >
          Every result links to the original source
        </Text>
        <Text variant="body">
          Each result records the model, harness, tasks, reported numbers, and
          original source. You can check the source before using a result to
          make a decision.
        </Text>

        <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {evidenceStats.map((stat) => (
            <div
              className="grid content-start gap-2"
              key={stat.label}
            >
              <dt>
                <Text variant="value">{stat.label}</Text>
              </dt>
              <dd>
                <Text
                  as="span"
                  variant="heading"
                >
                  {stat.value}
                </Text>
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <ArticleLink to="/explore">Explore the results →</ArticleLink>
          <ArticleLink to="/evidence">View the sources →</ArticleLink>
        </div>
      </ArticleSection>
    </Article>
  );
}

export { OverviewArticle };
