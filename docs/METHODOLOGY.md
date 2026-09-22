# Research methodology

## Goal

The target research result is one cross-study graph of quality against
`cost_per_task` for coding-agent systems. The horizontal axis shows cost per
attempted task in USD. The vertical axis shows the declared quality outcome.
Each system is a model, harness, and effort setting. The graph shows estimates
and uncertainty from a Bayesian analysis, not a rank made from raw scores.

The analysis considers every relevant captured study. A study can inform the
quality estimate, the cost estimate, or both. A plotted system needs enough
connected evidence to estimate both axes. The graph identifies studies that
could not inform an axis and explains why. Adding more studies is part of the
research plan; the current snapshots do not set the limits of the final graph.

This document describes the planned analysis. The current build stops at
[`evidence.parquet`](DATASETS.md). It does not fit a model or produce the graph.

## What the axes mean

Quality needs one declared meaning within each analysis. The first candidate
is the probability that an attempted task is solved. A partial score can enter
that analysis only if its scoring rule supports the same outcome. Otherwise it
needs a separate quality analysis. A mean score that excludes failed tasks does
not measure success across all attempted tasks.

`cost_per_task` means the mean USD cost of an attempted task, including failed
attempts and timeouts when their costs are known. Source metrics with a
different denominator, such as cost per completed task, keep their original
meaning. The analysis records the pricing date and accounting basis. Metered
API bills and hardware-derived costs do not share an absolute USD scale without
a declared conversion or pricing scenario.

The target graph uses one stated quality definition and one stated cost basis.
It also names the task population to which both estimates apply. Absolute USD
coordinates need observed cost levels under the chosen pricing basis. Relative
cost differences alone cannot set that scale.
If the evidence cannot support a shared scale, the analysis reports separate
groups instead of placing incomparable estimates on one axis. A study that
reports only one outcome still contributes to that outcome where its evidence
is comparable.

## How studies connect

The model, harness, and effort IDs form the candidate join key across studies.
Exact agreement on every prompt, tool, timeout, and task set is not required.
The analysis records these differences to explain variation and to test how
much each study affects the result. It does not reject a study merely because
one of these settings differs.

Before fitting, review each source's task family, scoring rule, cost
denominator, system version, run settings, and failure handling. Record whether
the source informs quality, cost, or both. Identify reports that reuse tasks or
runs so that one evaluation campaign does not count as independent evidence
twice. Preserve links from every decision to the source rows and artifacts.

A shared system connects comparisons only when the outcome has the same
meaning on both sides of the link. Keep disconnected groups separate. Review
weak links and plausible differences in task difficulty before interpreting an
indirect comparison. The review makes inclusion broad and its assumptions
visible; it does not treat matching system IDs as proof of comparability.

## Bayesian analysis

The primary candidate is a hierarchical random-effects network meta-analysis.
Within each study, estimate differences between systems on shared tasks and
their uncertainty. Group repeated trials by task. Preserve dependence when
several systems use the same tasks or when one run reports both outcomes.

Combine the within-study comparisons through shared systems. Study-specific
baselines account for differences in benchmark difficulty. Between-study
variation describes how system effects change across studies. Do not average
raw benchmark scores or raw per-study cost ratios to locate a system on the
graph.

Quality and cost can need different likelihoods and effect scales. For the
binary quality candidate, model task success as a binary outcome. For cost,
define how the model treats zero costs, failures, timeouts, and skewed values.
Specify the likelihoods, priors, cost basis, and practical difference thresholds
before fitting. Aggregate results enter an outcome only when their denominator
and uncertainty support that outcome. A point estimate alone does not supply
its sampling uncertainty.

First fit and check each outcome. The final graph needs joint posterior draws
for quality and cost, or an explicit sensitivity analysis for unknown
dependence between them. Marginal intervals alone cannot give the probability
that a system is preferable on both axes. A later Pareto view may use these
draws, but Pareto membership is not the primary research result.

## Research workflow and graph

Use a notebook to inspect the evidence, map study connections, plot
within-study comparisons, and develop the model. Keep the final calculations
in reproducible research code so the notebook and graph can be regenerated
from pinned source snapshots. The web app receives only the completed research
graph after its analysis and checks exist.

The graph labels both axes and the reference cost basis. For each system, show
the posterior estimate and uncertainty on both axes. State which studies inform
each estimate, whether the links are direct or indirect, and how many
independent evaluation campaigns contribute. Link the plotted estimates to
their study comparisons and source artifacts. Show exclusions, disconnected
groups, and results that change under reasonable modeling choices.

## Checks before publication

Test the estimator and graph code on simulated data with known effects. Check
posterior predictions, model convergence, between-study variation, and
sensitivity to priors. Compare direct and indirect evidence where the network
allows it. Repeat the analysis without each study and without weak links.
Check how alternative task-family groups and cost accounting choices change
the graph.

More task rows within one study reduce uncertainty about that study. They do
not replace independent studies needed to learn between-study variation. If a
few studies or one bridge study drive an estimate, show that dependence on the
graph rather than presenting a precise rank.

## Current evidence limit

The pinned snapshots come from Kroda, OpenBench, and Aarora. Kroda and some
OpenBench snapshots share the GPT-5.5, Codex, medium-effort system and report
`solved`. This is a candidate quality link. The OpenBench snapshots are related
reports and need a check for reused tasks and runs.

No two pinned sources currently share both a system and the `cost_usd` metric.
Aarora reports cost per scored task on two different cost bases and a mean
quality score that excludes failed tasks. These values cannot yet define the
target cross-study graph. More sources and a cost-basis review are needed.

## Implementation order

1. Build a reviewed record of study settings, shared-data campaigns, outcome
   definitions, cost bases, and inclusion decisions. Report the network for
   each axis. The current evidence rows have `condition`, but do not encode all
   settings needed for this review.
2. Use a notebook to inspect both networks and within-study comparisons.
   Implement the comparisons with uncertainty and dependence in research code.
3. Fit and check the Bayesian model for quality and cost. Test prior and
   leave-one-study-out sensitivity.
4. Generate joint quality and cost estimates where the evidence supports them.
   Publish the checked graph as a derived research artifact. Pass that artifact
   to the web app after the research pipeline produces it.

Analysis outputs belong in separate derived artifacts. The canonical evidence
table remains unchanged.
