import { Link } from '@tanstack/react-router';

import { Article } from '@/shared/components/article';
import { ArticleSection } from '@/shared/components/article-section';
import { Text } from '@/shared/components/text';

function MethodologyAbstract() {
  return (
    <ArticleSection>
      <Text variant="heading">What this methodology measures</Text>
      <Text variant="body">
        This project studies how the choice of coding-agent harness changes the
        performance of a fixed language model. A harness is the software that
        gives the model instructions, repository context, tools, and an
        execution loop. We compare published runs in which the model and task
        set stay the same while the harness changes.
      </Text>
      <Text variant="body">
        The method does not produce a universal ranking. It identifies harnesses
        that offer useful tradeoffs between result quality and resource use
        under the conditions of one study. Quality is compared separately with
        time, cost, and token use.
      </Text>
    </ArticleSection>
  );
}

function MethodologyArticle() {
  return (
    <Article>
      <MethodologyAbstract />
      <ArticleSection>
        <Text variant="heading">Research question and unit of comparison</Text>
        <Text variant="body">
          The research question is narrow: when the model and evaluation tasks
          are fixed, which harnesses provide the strongest tradeoffs between
          quality and resource use? The unit of analysis is a comparison group
          taken from one published study.
        </Text>
        <Text variant="body">
          Every result in a comparison group must use the same model release,
          benchmark, task subset, scoring procedure, and source methodology. The
          harness is the variable that changes. If a source changes model
          settings, prompts, tool permissions, timeouts, or tasks for one run,
          that run is separated from the group or excluded.
        </Text>
        <Text variant="body">
          We keep comparisons inside a single study. Two sources may use the
          same benchmark name but differ in repository snapshots, evaluator
          versions, infrastructure, retry rules, or accounting methods.
          Combining their numbers would imply a level of comparability that the
          evidence does not support.
        </Text>
      </ArticleSection>
      <ArticleSection>
        <Text variant="heading">How results enter a comparison</Text>
        <Text variant="body">
          A result is eligible when the source identifies the model, harness,
          task population, and scoring method, and reports a quality value plus
          at least one resource value. The resource value may describe time,
          monetary cost, or tokens.
        </Text>
        <Text variant="body">
          Model family names are not enough. The release and published
          configuration must match. Task names are treated in the same way. A
          full benchmark run and a selected subset form different comparison
          groups even when both use the same benchmark label.
        </Text>
        <Text variant="body">
          Missing values remain missing. We do not replace them with zero,
          estimate them from charts without a readable scale, or borrow them
          from another study. A result without the metric required for a chart
          is excluded from that chart but may remain eligible for another
          comparison.
        </Text>
        <Text variant="body">
          Primary comparisons have enough information for direct analysis.
          Sensitivity comparisons have a known limitation that may affect the
          ordering of results. We publish them with that limitation, but do not
          use them to support a general ranking. A group with fewer than two
          eligible results is marked as insufficient data.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">How outcome quality is evaluated</Text>
        <Text variant="body">
          Quality measures how much of the benchmark a run completed correctly.
          Higher values are better. We use the quality definition published by
          the source rather than converting different scoring systems into one
          scale.
        </Text>
        <Text variant="body">
          For pass or fail evaluations, the main measure is tasks solved. It
          equals successful attempts divided by evaluated attempts. Failed and
          timed-out attempts remain in the denominator. For graded evaluations,
          we use the published arithmetic mean on the source's score scale. A
          pass rate and a mean score are different measures and never appear on
          the same comparison axis.
        </Text>
        <Text variant="body">
          When the source reports a confidence interval, we store its lower
          bound, upper bound, confidence level, and method. The interval is
          shown with the point estimate. It describes uncertainty in the
          reported quality value, but does not replace that value in the Pareto
          calculation.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">How time, cost, and tokens are evaluated</Text>
        <Text variant="body">
          Resource measures are evaluated separately, and lower values are
          better. We preserve the source's unit, aggregation method, and
          population. Similar labels are not assumed to describe the same
          quantity.
        </Text>
        <Text
          as="h3"
          variant="body"
        >
          Time
        </Text>
        <Text variant="body">
          Median time is the median wall-clock duration across the attempts
          included by the source. Median time for successful attempts uses only
          successful runs and is treated as a separate metric. Total run time
          describes the wall-clock duration of a complete experiment and is
          compared only with another complete run from the same study.
        </Text>
        <Text
          as="h3"
          variant="body"
        >
          Cost
        </Text>
        <Text variant="body">
          Cost per successful attempt equals total reported cost divided by the
          number of successful attempts. Failed attempts contribute to total
          cost but do not increase the success count. Cost per scored task
          equals total cost divided by the number of tasks that received a
          score. We do not mix these denominators.
        </Text>
        <Text
          as="h3"
          variant="body"
        >
          Tokens
        </Text>
        <Text variant="body">
          Fresh tokens per solution count uncached input and output tokens per
          successful attempt. Runtime tokens per task use the context count
          reported by the harness during execution. Input tokens per run and
          total tokens per run retain the totals or means published by the
          source. Cached tokens, fresh tokens, and total tokens are not
          converted into one another unless the source supplies every term
          needed for that conversion.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">Pareto dominance and the decision set</Text>
        <Text variant="body">
          Each analysis compares one quality measure with one resource measure.
          We do not create a weighted score because a fixed weight would impose
          one user's priorities on every reader. Instead, we use Pareto
          dominance.
        </Text>
        <Text variant="body">
          Result X dominates result Y when X has equal or higher quality and
          equal or lower resource use, with at least one strict improvement. A
          dominated result solves no more tasks and uses no fewer resources than
          another available result. The non-dominated results form the Pareto
          front.
        </Text>
        <Text variant="body">
          Consider three harnesses. Harness A solves 82 percent of tasks at 2
          dollars per task. Harness B solves 79 percent at 1 dollar per task.
          Harness C solves 78 percent at 2 dollars per task. A remains because
          it has the highest quality. B remains because it has the lowest cost.
          C is removed because A has higher quality at the same cost.
        </Text>
        <Text variant="body">
          Membership in the Pareto front is not proof of statistical
          superiority. The front describes the published point estimates. A
          reader should inspect confidence intervals, sample sizes, and source
          caveats before treating a small difference as meaningful.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">Source records and evidence grades</Text>
        <Text variant="body">
          Every result retains its source URL, study identifier, model, harness,
          benchmark, sample information, metrics, accounting notes, and known
          caveats. This record lets a reader trace a displayed value back to the
          publication that reported it.
        </Text>
        <Text variant="body">
          Grade A evidence has a direct result table, a clear model and task
          match, sample information, and usable metric definitions. Grade B
          evidence supports a comparison but has a material reporting gap, such
          as incomplete token accounting or an unpinned source snapshot. Grade C
          evidence is useful for sensitivity analysis, but a caveat may change
          the result. Evidence grades describe documentation quality, not
          harness quality.
        </Text>
        <Text variant="body">
          We record exclusions at the result and comparison level. Common
          reasons include a missing metric, an unmatched model configuration, a
          different task population, incompatible accounting, or too few
          eligible results. Exclusion from one axis does not imply exclusion
          from the dataset.
        </Text>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">How these results should be interpreted</Text>
        <Text variant="body">
          The dataset supports conclusions within a comparison group. It does
          not support a universal harness winner. Studies use different
          repositories, task distributions, prompts, timeouts, evaluators,
          prices, hardware, and telemetry. Results from separate studies should
          not be read as if they came from one controlled experiment.
        </Text>
        <Text variant="body">
          Published pages can change, and some sources do not provide an
          immutable snapshot. Token and cost reporting are especially sensitive
          to caching, provider pricing, retries, and what the harness includes
          in its totals. These caveats remain attached to the affected
          comparison.
        </Text>
        <Text variant="body">
          The method is intended for screening choices. Use a Pareto front to
          identify candidates that fit a quality, time, cost, or token
          constraint. Then inspect the original source and test those candidates
          on the repositories and tasks that matter to the actual deployment.
        </Text>
      </ArticleSection>
      <ReferencesSection />
    </Article>
  );
}

function ReferencesSection() {
  return (
    <ArticleSection>
      <Text variant="heading">References and source material</Text>
      <ol className="grid gap-6">
        <li className="grid grid-cols-[--spacing(10)_1fr] gap-3">
          <Text variant="value">[1]</Text>
          <a
            className="w-fit border-b border-white/40 pb-1"
            href="https://doi.org/10.1007/978-1-4615-5563-6"
            rel="noreferrer"
            target="_blank"
          >
            <Text variant="inline">
              Kaisa Miettinen. Nonlinear Multiobjective Optimization. Springer,
              1998.
            </Text>
          </a>
        </li>
        <li className="grid grid-cols-[--spacing(10)_1fr] gap-3">
          <Text variant="value">[2]</Text>
          <a
            className="w-fit border-b border-white/40 pb-1"
            href="https://doi.org/10.1080/01621459.1927.10502953"
            rel="noreferrer"
            target="_blank"
          >
            <Text variant="inline">
              Edwin B. Wilson. Probable Inference, the Law of Succession, and
              Statistical Inference. 1927.
            </Text>
          </a>
        </li>
        <li className="grid grid-cols-[--spacing(10)_1fr] gap-3">
          <Text variant="value">[3]</Text>
          <Link
            className="w-fit border-b border-white/40 pb-1"
            to="/evidence"
          >
            <Text variant="inline">
              Project evidence registry and source list.
            </Text>
          </Link>
        </li>
        <li className="grid grid-cols-[--spacing(10)_1fr] gap-3">
          <Text variant="value">[4]</Text>
          <a
            className="w-fit border-b border-white/40 pb-1"
            href="/data/research.json"
          >
            <Text variant="inline">Machine-readable research dataset.</Text>
          </a>
        </li>
      </ol>
    </ArticleSection>
  );
}

export { MethodologyArticle };
