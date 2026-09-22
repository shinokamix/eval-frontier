# Research methodology

Eval Frontier aims to compare coding-agent systems across public studies. The
planned output is a set of cross-study graphs with uncertainty, not a single
ranking. Each graph names its task family, outcome, resource measure, and
eligible evidence.

This document describes the planned analysis. The current build stops at
[`evidence.parquet`](DATASETS.md). It does not yet estimate effects or publish
cross-study graphs.

## Research question

For a declared task family and outcome, how likely is system A to outperform
system B after accounting for sampling uncertainty and differences between
studies? A system is a model, harness, and effort setting. Exact run settings
must be reviewed from the source artifacts before configurations are pooled.

The answer is conditional on the selected studies and their compatibility.
Different task families or resource accounting rules need separate analyses.

## From source rows to a comparable network

1. Define the outcome and its denominator before looking at results. Examples
   are the probability of solving an evaluated task and mean cost per attempt.
   Quality, cost, time, and tokens are separate outcomes.
2. Review each study's task set, scoring rule, model release, effort, prompt,
   tools, timeout, execution environment, and resource accounting. Record why a
   result is included, separated, or excluded. Preserve the source rows behind
   each decision.
3. Identify reports that reuse tasks or runs. Count one evaluation campaign
   once unless its dependence can be modeled.
4. Build a network for each compatible task family and outcome. Systems are
   nodes. A study that evaluates several systems on a shared task population
   supplies a comparison among those nodes. A system appearing in several
   studies can connect their comparisons.

A shared system name does not prove that studies are compatible. Unconnected
network components remain separate. We do not infer a comparison between them.

## Planned Bayesian model

The primary candidate is a hierarchical random-effects network meta-analysis.
It has two stages:

1. Within each study, estimate differences between its systems and the
   uncertainty of those differences. Keep repeated trials for one task
   together. Preserve covariance when several systems share tasks or when one
   run reports several outcomes.
2. Combine compatible study differences in a Bayesian network model. The
   model estimates relative system effects and variation in those effects
   between studies. Study-specific baselines account for benchmark difficulty;
   raw scores from different benchmarks are never averaged directly.

The effect scale, likelihood, priors, and practical difference threshold must
be fixed for each outcome before fitting. Task-level and aggregate sources may
enter the same model only when they estimate the same quantity and provide
enough information to estimate uncertainty. A published point estimate alone
is insufficient for the primary model.

The initial model should fit one outcome at a time. A graph that assigns a
probability of Pareto membership needs joint posterior draws for quality and
the selected resource outcome, or an explicit sensitivity analysis for their
unknown correlation. Marginal intervals alone cannot supply that probability.

## Cross-study graphs

The first graph for an eligible network should show relative effects against
a named reference system, posterior intervals, the number of contributing
studies, and whether a comparison is direct or indirect. Separate views can
show quality against cost, time, or tokens. Resource axes must state whether
they show per-attempt values or ratios to the reference. Absolute cost claims
also need a shared pricing and accounting basis.

Later, a joint model can report the probability that each eligible system is
not dominated on quality and one resource measure. Such a probability depends
on the candidate set and the chosen practical difference thresholds. It is
not a universal score.

Every plotted result must link back through its study contrast to the input
rows and their source artifacts. A graph must expose disconnected components,
excluded evidence, and results that depend strongly on modeling assumptions.

## Checks before publication

Check that the network is connected for the proposed comparison and that
task composition and study settings make indirect comparisons plausible.
Inspect repeated-data dependence, model convergence, posterior predictions,
between-study variation, and sensitivity to priors and individual studies.
Compare direct and indirect evidence where the network permits it. Test the
full estimator and graph pipeline on simulated data with known effects before
interpreting a real result.

More task rows within one study reduce uncertainty about that study. They do
not replace independent studies needed to learn between-study variation. With
few studies or weak links, posterior results can depend heavily on the prior
and on one bridge study. The graphs must show that limitation rather than
present a precise rank.

## Current evidence limit

The six pinned snapshots come from three source projects. Shared systems with
the same `solved` or `duration_s` metric connect Kroda to three OpenBench
snapshots through GPT-5.5, Codex, and medium effort. This is a candidate link,
subject to task-family and configuration review. The four OpenBench snapshots
are related reports and must be checked for reused tasks and runs.

No two pinned sources currently share both a system and the `cost_usd` metric.
Aarora reports aggregate outcomes with different metric definitions. Its
overlapping system names do not by themselves connect it to a quality or cost
network. The present data therefore cannot support a broad cross-study cost
graph. More compatible, independent studies are needed to assess generality.

## Implementation order

1. Produce a reviewed registry of compatible groups, exact configurations,
   shared-data clusters, accepted metrics, and exclusions. Generate a network
   report for each proposed outcome. The current evidence rows have `condition`
   but do not encode all prompt, tool, timeout, and environment details needed
   for this review. This registry is the next research deliverable.
2. Implement within-study contrasts with uncertainty and covariance. Verify
   them against direct calculations and simulated data.
3. Fit one connected network for one outcome. Publish posterior contrasts and
   diagnostics, then test leave-one-study-out and prior sensitivity.
4. Add further outcomes and networks. Build joint quality-resource draws only
   where the data support them, then publish cross-study Pareto graphs.

Analysis outputs belong in separate derived artifacts. The canonical evidence
table remains unchanged.
