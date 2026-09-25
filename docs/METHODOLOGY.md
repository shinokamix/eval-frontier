# Research methodology

## Goal

The target research result is a cross-study graph of relative success and
relative reported USD cost for coding-agent systems. Each system is a model,
harness, and effort setting. The horizontal axis shows a typical within-study
ratio of mean cost per attempted task to a named reference system. The vertical
axis shows the average change in task success probability from that system, in
percentage points, across a declared set of evaluation campaigns. The graph
shows estimates and uncertainty from a Bayesian analysis, not a rank made from
raw scores.

The analysis considers every relevant captured study. A study can inform the
quality estimate, the cost estimate, or both. A plotted system needs enough
connected evidence to estimate both axes. The graph identifies studies that
could not inform an axis and explains why. Adding more studies is part of the
research plan; the current snapshots do not set the limits of the final graph.

This document describes the planned analysis. The current build stops at
[`evidence.parquet`](DATASETS.md). It does not fit a model or produce the graph.

## What the axes mean

The primary quality outcome is whether an attempted task is solved. Failures
and timeouts count in the denominator. A source that excludes some attempts
from scoring cannot enter this outcome without a supported conversion. Partial
scores and pass@k measure different outcomes and need separate analyses.

The primary cost outcome is reported USD spent per attempted task, including
failed attempts and timeouts when their costs are known. A horizontal value of
0.7 means the system typically costs 70% as much as the reference. A value
above 1 means higher cost. Within a study, both costs must cover the same
charges and kinds of attempts. Record the source's accounting basis, cost
coverage, and any reported pricing date. USD ratios do not remove differences
in what sources count as cost.

The vertical value is the system's success probability minus the reference
system's success probability, multiplied by 100 and averaged over the target
campaigns. A value of +5 means five percentage points more attempted tasks
solved on average across those campaigns. This difference depends on task
difficulty. Model quality effects on a scale suitable for binary outcomes,
then calculate the percentage-point difference from posterior draws. Do not
divide each study's score by its best score.

## Target comparisons

Define one evaluation campaign as one independent set of tasks and runs under
a stated scoring and cost protocol. Reports that reuse a campaign do not add
another independent unit. Choose target campaigns with usable quality and cost
comparisons before fitting. Give each independent campaign equal weight in the
primary summary, so a large leaderboard does not determine the target
population by itself. Show how the result changes under declared task-family
weights.

For each campaign, estimate the difference in success probability and the
ratio of arithmetic mean costs per attempted task between a system and the
reference. The vertical coordinate is the weighted average of the campaign
success differences in percentage points. The horizontal coordinate is the
exponential of the weighted average of campaign log cost ratios. It is a
typical multiplicative cost ratio, not a ratio of pooled USD totals. Use the
same target campaigns for both coordinates. Evidence from a campaign that
informs only one outcome may still help estimate that outcome, but it does not
silently change the target population of the final two-axis point.

Posterior predictions may supply a comparison when the reference was not run
in a target campaign, provided reviewed shared systems connect the evidence.
Do not predict across disconnected groups. Report which coordinates depend on
indirect comparisons and how much each campaign contributes.

Use benchmark-reported USD cost in the primary cost analysis. A published
total can become mean cost per attempted task only when the number and cost
coverage of those attempts are known. When two configurations have the same
number of attempted tasks and complete cost coverage, their ratio of total
costs equals their ratio of mean costs per attempted task. Otherwise, normalize
each total by its supported attempt count. A cost per completed task, scored
attempt, rollout, or full benchmark run retains that meaning until the source
supports conversion. Exclude incomplete or ambiguous cost coverage from the
primary cost estimate and record the reason. The result may still inform
quality. Token counts are a separate resource outcome, not a substitute for
USD cost. The primary analysis does not maintain an API price schedule or
calculate USD from tokens.

Review missing costs by system, task, and success outcome. Missing costs can
change a comparison if expensive failures or particular systems are more
likely to lack a reported value. Keep complete-case results separate from
sensitivity analyses that make explicit assumptions about those missing costs.

The reference system sets both relative axes to 1 for cost and 0 for quality.
Choose it before fitting, based on the reviewed comparison network. It need
not appear in every study, but connected comparisons must support an indirect
estimate. Reference choice changes the coordinates, not the underlying pairwise
comparisons. Report disconnected groups separately. A study with one usable
outcome can still inform that outcome.

## How studies connect

The model, harness, and effort IDs form the candidate join key across studies.
Exact agreement on every prompt, tool, timeout, and task set is not required.
The analysis records these differences to explain variation and to test how
much each study affects the result. It does not reject a study merely because
one of these settings differs.

Before fitting, review each source's task family, scoring rule, cost
denominator, cost coverage, system version, run settings, and failure handling.
Record whether the source informs quality, cost, or both. Identify reports that
reuse tasks or runs so that one evaluation campaign does not count as
independent evidence twice. Preserve links from every decision to the source
rows and artifacts.

A shared system connects comparisons only when the outcome has the same
meaning on both sides of the link. Keep disconnected groups separate. Review
weak links and plausible differences in task difficulty before interpreting an
indirect comparison. The review makes inclusion broad and its assumptions
visible; it does not treat matching system IDs as proof of comparability.

## Bayesian analysis

The primary candidate is a hierarchical, two-outcome random-effects network
meta-analysis. Within each study, estimate differences between systems on
shared tasks and their uncertainty. Group repeated trials by task. Preserve
dependence when several systems use the same tasks or when one run reports both
outcomes. Use task effects where task-level results exist. Studies with only
configuration aggregates need a likelihood that reflects their published
denominators and uncertainty.

Combine the within-study comparisons through shared systems. Separate study
baselines account for benchmark difficulty and cost levels. Between-study
variation describes how system effects change across studies. Estimate quality
effects on a binary-outcome scale. Model arithmetic mean cost with a log link,
or derive arithmetic mean cost ratios from the chosen cost likelihood. Do not
average raw benchmark scores or raw per-study cost ratios to locate a system
on the graph.

For cost, define how the model treats zero costs, failures, timeouts, and skewed
values. Specify the likelihoods, priors, cost basis, campaign weights,
and practical difference thresholds before fitting. Aggregate results enter
an outcome only when their denominator and uncertainty support that outcome.
A point estimate alone does not supply its sampling uncertainty. A ratio of
geometric mean costs must not be labeled as a ratio of arithmetic mean costs.
For an aggregate cost without a reported spread, seek trial-level data or a
supported uncertainty estimate. If neither exists, present the cost comparison
descriptively. Any model that supplies its uncertainty mainly through a prior
must report that dependence and remain a sensitivity analysis.

First fit and check each outcome. The final graph needs joint posterior draws
for quality and cost, or an explicit sensitivity analysis for unknown
dependence between them. Marginal intervals alone cannot give the probability
that a system is preferable on both axes. A later Pareto view may use these
draws, but Pareto membership is not the primary research result.

## Research workflow and graph

Use a notebook to inspect the evidence, map study connections, plot
within-study comparisons, and develop the model. Keep the final calculations
in reproducible research code so the notebook and graph can be regenerated
from pinned source snapshots.

The graph labels both relative axes, the reference system, the task population,
and the cost accounting basis. For each system, show the posterior estimate and
uncertainty on both axes. State which studies inform each estimate, whether the
links are direct or indirect, and how many independent evaluation campaigns
contribute. Link the plotted estimates to their study comparisons and source
artifacts. Show exclusions, disconnected groups, and results that change under
reasonable modeling choices.

## Checks before publication

Test the estimator and graph code on simulated data with known effects. Check
posterior predictions, model convergence, between-study variation, and
sensitivity to priors. Compare direct and indirect evidence where the network
allows it. Repeat the analysis without each study and without weak links.
Check how alternative task-family groups, campaign weights, and cost accounting
choices change the graph. Explore the effect of plausible assumptions about
missing costs and uncertain cost coverage outside the primary analysis.

More task rows within one study reduce uncertainty about that study. They do
not replace independent studies needed to learn between-study variation. If a
few studies or one bridge study drive an estimate, show that dependence on the
graph rather than presenting a precise rank.

## Current evidence limit

Each pinned source has a reviewed `review.json` with its quality and cost
readiness, admission rules, and exclusions. The
[source audit notebook](../research/analysis/notebooks/source_audit.py) applies
those decisions to all six sources. DeepSWE and both Terminal-Bench versions now include
captured trial details, and Android Bench includes task-level pass counts.
The audit reports admitted cost subsets, missingness, aggregate mismatches,
and candidate system links. These checks do not establish comparable cost
accounting or independent campaigns.

FrontierCode still lacks confirmed aggregate denominators and cost spread.
Android Bench lacks trial costs and effort settings. Review the surviving
comparisons before fitting; the pipeline does not yet produce model estimates.

## Implementation order

1. Build a reviewed record of study settings, shared-data campaigns, outcome
   definitions, reported USD cost bases, denominators, coverage, missingness,
   uncertainty, and inclusion decisions. Report the network for each axis and
   choose a reference system and target campaigns. The current evidence rows
   have `campaign_id`, retry, and scoring fields, but do not encode all settings
   needed for this review.
2. Use a notebook to inspect both networks and within-study comparisons.
   Implement the comparisons with uncertainty and dependence in research code.
3. Fit and check the quality and cost models, then their joint analysis. Test
   prior, campaign-weight, and leave-one-study-out sensitivity.
4. Generate joint relative quality and cost estimates where the evidence
   supports them. Publish the checked graph as a derived research artifact.

Analysis outputs belong in separate derived artifacts. The canonical evidence
table remains unchanged.
