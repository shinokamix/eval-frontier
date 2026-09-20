# Scoring method reference

This reference defines scoring method version `1.0`. The method consumes the tables
from [`DATASETS.md`](DATASETS.md). [`METHODOLOGY.md`](METHODOLOGY.md) explains
the design choices.

## Identifiers

The method uses these identifiers:

- A system key contains `model_id`, `harness_id`, and `effort`.
- A `configuration_id` identifies the exact run settings.
- A `comparison_group_id` identifies systems tested under shared conditions.
- An `independence_cluster_id` groups reused tasks, runs, infrastructure, or
  published results.
- A `metric_definition_id` identifies the direction, unit, statistic,
  population, denominator, and accounting basis.
- A `network_component_id` identifies one connected component.
- An `analysis_profile_id` identifies primary or sensitivity inputs.
- An `anchor_profile_id` selects one anchor for each family and metric.

## Analysis profiles

The primary profile includes a study result when all these conditions hold:

- `compatibility_status` is `primary`.
- `evidence_grade` is `A` or `B`.
- `family_assignment_status` is `primary`.
- The result has no exclusion for the selected metric.

A sensitivity profile lists each difference from the primary profile. Examples
include grade `C`, an ambiguous family assignment, a material configuration
difference, or an alternative tie rule.

Each configuration difference rule has one action:

- `record` keeps the difference as metadata.
- `sensitivity` includes the evidence and tests its removal.
- `exclude` removes the evidence from the primary profile.

An overall compatibility status follows these rules:

- `primary` has no failed domain. An unknown setting can remain when every
  system in the study shared it.
- `sensitivity_only` has a concern that can change a relative result.
- `incompatible` has a failed task, evaluator, metric, or accounting domain.
- `unknown` lacks enough information to determine whether systems shared the
  same conditions.

## Local comparison eligibility

Two study results produce a local comparison only when all these conditions
hold:

- Both results belong to the same `comparison_group_id`.
- Both results belong to the same task family.
- Both results resolve the full system key.
- Both results use compatible metric definitions.
- Both results pass the selected analysis profile.
- Neither result has an applicable exclusion.

A versioned compatibility rule can map two metric definitions into one analysis
definition. Without that rule, the method keeps the definitions separate.

## Local outcomes

The method creates one outcome for every eligible pair of systems.

The metric direction determines the winner:

- Higher quality wins.
- Lower cost wins.
- Lower time wins.
- Lower token use wins.

`outcome_a` has one of three values:

```text
win  = 1.0
tie  = 0.5
loss = 0.0
```

Values equal at the precision published by the source produce a tie. A
source-reported statistical tie also produces a tie. A metric can name a
versioned `tie_threshold_id`. The default threshold is exact equality at the
published precision.

Sample size does not change `outcome_a` or `outcome_weight`. Sample size
contributes to effect uncertainty and evidence metadata.

## Effect sizes

The effect estimate table stores one or more effect sizes for each local
comparison when the source provides enough data.

For a binary success metric, the primary effect is the risk difference:

```text
effect_a = success_rate_a - success_rate_b
```

When success counts and sample sizes exist, the comparison also stores a log
odds ratio.

For a bounded partial score, the MVP uses the difference on the reported scale:

```text
effect_a = score_a - score_b
```

For a positive resource metric where lower is better, the effect is a log
ratio:

```text
effect_a = log(value_b / value_a)
```

A positive effect always favors system A. Each estimate stores
`effect_measure_id`, `effect_a`, `standard_error`, and interval fields.

Task-level bootstrap supplies uncertainty when task-level observations exist.
Published intervals or sufficient counts supply uncertainty for aggregate
results. If neither source exists, the uncertainty fields remain missing.

The MVP ranking does not use effect sizes. Published artifacts retain them for
review and later scoring methods.

## Comparison weights

Each independence cluster receives total weight `1` for one task family,
metric definition, and analysis profile.

The method divides the weight in three steps:

1. Eligible studies split the cluster weight equally.
2. Eligible comparison groups split their study weight equally.
3. Pairwise outcomes split their comparison-group weight equally.

For cluster `c`, study `s`, comparison group `g`, and pair `p`:

```text
weight(p) = 1 / study_count(c)
              / group_count(s)
              / pair_count(g)
```

The counts include only eligible inputs. Pair weights in one independence
cluster sum to `1`.

## Comparison networks

The method builds a separate graph for each task family, metric definition, and
analysis profile. Systems are nodes. Local outcomes are weighted edges.

The method finds connected components before model fitting. It never ranks
systems from separate components against each other.

The method also records bridges and articulation nodes. These fields identify
comparisons whose removal would split the network.

## Bradley-Terry fit

For systems `i` and `j`, the model is:

```text
P(i beats j) = sigmoid(beta_i - beta_j)
```

The fit uses local outcomes and their weights. A tie contributes half a win to
each system.

The fit maximizes the weighted log likelihood plus the log density of this
independent prior:

```text
beta_i ~ Normal(0, 2.5)
```

The prior prevents infinite estimates when a system wins or loses every
comparison. The method configuration records the prior and its sensitivity
profiles.

## Family scores

An anchor profile selects one anchor system for each task family and metric.
The selected anchor must belong to the fitted network component.

For system `i` and anchor `a`:

```text
FamilyScore(i) = 100 * sigmoid(beta_i - beta_a)
```

The anchor score is `50`. A score of `70` means an estimated 70 percent chance
of beating the anchor under the fitted model.

If a component does not contain the selected anchor, the method selects a local
reference. It sets `reference_status` to `component_local`. Family scores from
separate local components do not share a scale.

The local reference is the system with the greatest total incident outcome
weight. A tie uses the lexical order of the system key. An `anchor_profile_id`
never changes its selected anchors after publication.

The method fits quality, cost, time, and token scores separately. A higher
family score is always better. For a resource metric, a higher score means
greater efficiency.

## Pairwise probabilities

For every pair in one connected component, the method publishes:

```text
P(i beats j) = sigmoid(beta_i - beta_j)
```

The output identifies direct and indirect evidence. Pairwise probabilities are
the primary model output. Family scores provide a compact view relative to an
anchor.

## Global scores

A weight profile assigns one weight to each task family. Weights sum to `1`.

An anchor profile selects a compatible family score for each task family and
metric. A system must cover every family required by the selected profile.

For system `i`:

```text
GlobalScore(i) = sum_f weight_f * FamilyScore(i, f)
```

The method does not renormalize over missing families. It sets
`coverage_status` to `insufficient_coverage` instead.

Systems enter the same global comparison only when they use the same weight
profile, anchor profile, analysis profile, and covered family set.

## Bootstrap uncertainty

The default method uses 2,000 bootstrap iterations with a recorded seed.

Each iteration performs these steps:

1. Sample independence clusters with replacement.
2. Include every eligible study in each selected cluster.
3. Sample tasks with replacement when task-level data exists.
4. Rebuild local outcomes and comparison weights.
5. Refit Bradley-Terry.
6. Recalculate family scores, global scores, and Pareto fronts.

An aggregate-only study contributes at the cluster and study levels. Its tasks
cannot be resampled.

An iteration is valid for a score only when the sampled data preserve the path
between that system and its anchor. The output records all iteration counts and
the connectivity survival rate.

The method publishes a percentile interval when at least 1,000 iterations are
valid and the connectivity survival rate is at least `0.5`. Otherwise, the
interval remains missing with reason `insufficient_bootstrap_connectivity`.

The interval uses the 2.5 and 97.5 percent quantiles from valid iterations. The
central estimate comes from the full dataset.

## Stability checks

The method runs these checks for each primary fit:

- Remove each independence cluster in turn.
- Add each planned sensitivity input set.
- Move or remove ambiguous task-family assignments.
- Apply configured alternative tie thresholds.
- Apply configured alternative priors.

The output records the score range, rank range, and pairwise conclusion changes
for each check.

## Pareto views

The method publishes these views:

- Global quality and global cost efficiency.
- Global quality and global time efficiency.
- Global quality and global token efficiency.

System X dominates system Y when both conditions hold:

- X has equal or higher quality and equal or higher resource efficiency.
- X has a strict advantage on at least one axis.

The full-data estimates set `is_point_pareto`. Bootstrap iterations calculate
`probability_non_dominated` and pairwise dominance probabilities.

Systems enter one Pareto analysis only when they use the same analysis profile,
weight profile, anchor profile, and covered family set.

The method does not define a combined resource-efficiency score.

## Evidence grades

An evidence assessment records `pass`, `concern`, or `fail` for these domains:

- `provenance`.
- `configuration_completeness`.
- `task_evaluator_comparability`.
- `sample_replication`.
- `metric_completeness`.
- `independence`.

Each domain includes a reason and reviewer record. The final grade has one of
four values:

- `A` requires `pass` in every domain.
- `B` requires no `fail` and at least one `concern`.
- `C` requires sensitivity-only use because at least one domain fails.
- `D` means that provenance or metric failures prevent a valid comparison.

The evidence grade does not change a numerical comparison weight.

## Result statuses

Each score records separate statuses for separate limits.

`evidence_status` has these values:

- `supported` has at least three independence clusters and passes the planned
  sensitivity checks.
- `provisional` has fewer than three independence clusters or a material
  sensitivity concern.
- `insufficient_evidence` lacks enough eligible evidence for a score.

`reference_status` is `anchored` or `component_local`. `network_status` is
`stable` or `unstable_network`. `coverage_status` is `complete` or
`insufficient_coverage`.

The public ranking requires `anchored`, `stable`, and `complete`. It includes
both `supported` and `provisional` evidence. Other results remain available in
the evidence view.

## Method configuration

`method_config.json` records these inputs:

- method and dataset versions.
- task-family taxonomy and assignment reviews.
- metric definitions and compatibility rules.
- configuration difference rules.
- independence clusters.
- analysis profiles.
- anchor profiles.
- weight profiles.
- tie thresholds.
- Bradley-Terry prior.
- bootstrap settings and seed.
- evidence assessments and reviewer records.
- software versions.

Pinned source snapshots and `method_config.json` reproduce a published score.
