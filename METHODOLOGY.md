# Research methodology

## Status

This document describes the planned cross-study analysis for Harness Pareto. It
is the target method, not a description of every calculation in the current
build.

The current data pipeline can capture source artifacts, extract observations,
harmonize source labels, aggregate results within a study, and calculate
within-study Pareto fronts. Task-family classification, Plackett-Luce or
Bradley-Terry estimation, family scores, global scores, and cross-study
uncertainty are not implemented yet.

Implementation details for the current pipeline are in
[`data/README.md`](data/README.md).

## Research goal

Harness Pareto studies the performance of coding-agent configurations across
public benchmarks. It treats the model, harness, and effort setting as parts of
one configuration. The project aims to estimate relative performance across
partially overlapping studies without treating their raw measurements as if they
came from one experiment.

The target analysis is:

```text
raw studies -> task families -> local rankings -> PL/BT -> family scores
            -> weighted global scores -> Pareto fronts
```

The result is a set of useful tradeoffs, not a universal winner.

## Unit of analysis

One analysis point is a configuration:

```text
model x harness x effort
```

For example:

```text
GPT-5.6 Sol x Cursor x high
```

`model` identifies the exact model release rather than only its family.
`harness` identifies the agent software and, when the source reports it, its
version. `effort` records the reasoning budget or another comparable execution
setting published by the source.

Settings that may change behavior must remain attached to the result. These
include prompts, tool permissions, retry rules, timeouts, repository snapshots,
and harness configuration. Runs with materially different settings are separate
configurations or separate comparison groups.

## Source records and provenance

Data comes from public benchmark reports, result tables, papers, repositories,
and machine-readable artifacts published by benchmark authors or independent
researchers.

A source record should retain:

- the canonical source URL;
- immutable artifact URLs when available;
- captured source bytes and their SHA-256 checksums;
- the snapshot or commit identifier;
- acquisition time, license, and redistribution status;
- the location of each extracted observation in the source artifact.

Missing values remain missing. The pipeline must not replace them with zero,
infer them from an unreadable chart, or borrow them from another study.

## Study records

A study is one published experimental context. Its record should identify:

- benchmark and task subset;
- model, harness, and effort settings;
- scoring rules and evaluator version;
- prompts and tool permissions when reported;
- timeouts, retries, and failure handling;
- hardware and execution environment when reported;
- cost, time, and token accounting definitions;
- sample size and repeated trials;
- known limitations.

Raw values from separate studies are not directly comparable. Two studies may
use the same benchmark name while differing in task snapshots, scoring rules,
timeouts, prices, infrastructure, or accounting methods.

## Task families

Each benchmark is assigned to a task family before cross-study aggregation.
Initial families may include:

- software engineering;
- terminal and shell;
- general coding.

The taxonomy will grow as sources are added. Every assignment should have a
recorded rationale. A benchmark that measures materially different abilities
should not be grouped with another benchmark only because both involve code.

Ambiguous assignments should be marked for review. Sensitivity analysis should
show whether moving or excluding an ambiguous benchmark changes the result.

## Local comparisons

The first comparison happens inside one study and on one metric axis. Each local
comparison uses the conditions reported by that study rather than comparing raw
values across publications.

Metric direction is explicit:

- higher quality is better;
- lower cost is better;
- lower time is better;
- lower token use is better.

A local comparison produces an ordering, including ties when the evidence does
not distinguish two configurations. A configuration can appear on one metric
axis and be absent from another when the source does not report the required
value.

Quality, cost, time, and tokens remain separate. A pass rate is not converted
into a mean score. Median time over all attempts is not mixed with median time
over successful attempts. Fresh, cached, runtime, and total tokens remain
distinct unless the source reports the terms needed for a valid conversion.

## Cross-study ranking within a task family

Studies in one task family form a comparison network. Nodes are
`model x harness x effort` configurations. A study creates edges between the
configurations it compares.

When studies overlap, a Plackett-Luce or Bradley-Terry model can estimate a
shared relative score from the local outcomes. This permits incomplete
comparisons. Every configuration does not need to appear in every study.

A shared ranking requires a connected comparison network. If the network has
disconnected components, the analysis must report them separately. It must not
invent an ordering between components with no comparison path.

A separate model is fitted for each metric and task family. The output is a
relative score within that family. The score is not a raw success rate, dollar
amount, duration, or token count.

## Family scores

For configuration `i` and task family `f`, the analysis produces separate scores
such as:

```text
Q(i, software-engineering) = 0.82
Q(i, terminal-shell)       = 0.64
```

Equivalent family scores may be estimated for cost, time, and token use. Scores
from different metrics keep their own scales and models.

Each family score should include enough metadata to interpret it:

- contributing studies and benchmarks;
- comparison-network component;
- number of direct and indirect comparisons;
- confidence or credible interval;
- metric coverage;
- source and study exclusions.

## Global scores

Family scores can be combined only after their task families and weights are
explicit. For global quality:

```text
GlobalQuality(i) = sum_f w_f * Q(i, f)
```

The weights must sum to one over the included families. Equal family weights are
the initial default when there is no reason to prefer one task family.
Alternative profiles may use different published weights.

Coverage must remain visible. A configuration observed in one family should not
look equivalent to one supported across every family. The analysis must state
how it handles a missing family score and must not silently treat it as zero.

Cost, time, and token scores are aggregated separately. If the project later
publishes one resource-efficiency score, it must document the normalization and
weights used to combine those resource metrics. Separate quality-cost,
quality-time, and quality-token views remain available.

## Pareto analysis

Pareto analysis compares one quality score with one resource score at a time.
For example:

- global quality against global cost efficiency;
- global quality against global time efficiency;
- global quality against global token efficiency.

Result `X` dominates result `Y` when `X` has equal or higher quality and equal
or better resource efficiency, with at least one strict improvement. Results
that no other result dominates form the Pareto front.

A combined global resource-efficiency axis may also be published if its metric
weights and normalization are explicit. It does not replace the separate
resource views.

Pareto membership describes estimated scores. It is not proof of statistical
superiority. Close points may be indistinguishable once uncertainty is taken
into account.

## Reliability and coverage

Every published point should report:

- number of contributing studies;
- number of contributing benchmarks;
- number of covered task families;
- confidence or credible interval;
- coverage for quality, cost, time, and tokens;
- direct and indirect comparison counts;
- evidence grade and known caveats.

A score supported by one study must not look as reliable as the same point
estimate supported by ten studies. Visualizations should encode or display this
difference rather than showing only the score.

Evidence grades describe source and documentation quality, not configuration
quality. A high-performing configuration can have weak evidence, and a
low-performing configuration can have strong evidence.

## Interpretation limits

The analysis estimates relative performance from published evidence. It cannot
remove all differences in prompts, infrastructure, benchmark versions, prices,
or accounting methods.

The scores are best used to select configurations for further testing. Before a
deployment decision, readers should inspect the contributing studies and test
the candidates on their own repositories, tasks, and constraints.

## Open decisions

The following choices must be specified before the cross-study method becomes
the production analysis:

- the task-family taxonomy and review process;
- the definition of a win, loss, and tie for each metric;
- the choice between Plackett-Luce, Bradley-Terry, or a hierarchical extension;
- treatment of repeated trials and study-level dependence;
- uncertainty estimation and interval type;
- minimum network connectivity and evidence thresholds;
- handling of missing task-family scores;
- default family weights and optional user profiles;
- normalization and weights for any combined resource-efficiency score.

These decisions should be versioned with the dataset so a published score can be
reproduced under the method that produced it.
