# Dataset reference

This file defines the target data contract for Eval Frontier. The scoring
algorithm is defined in [`SCORING.md`](SCORING.md). The current implementation
is described in [`research/README.md`](../research/README.md).

## Data flow

```text
source artifacts -> observations -> measurements -> study results
                                                -> local comparisons
                                                -> family scores
                                                -> global scores
                                                -> Pareto views
```

## Contract rules

- Source snapshots are immutable.
- Every extracted record links to a location in a source artifact.
- Raw measurements and estimated values use separate tables.
- Missing values remain missing.
- Each metric defines its direction, unit, statistic, population, denominator,
  and accounting basis.
- Each study resolves to an `independence_cluster_id`.
- Reviews and policies have versions and reviewer records.
- Schema versions and method versions change independently.

## Storage formats

Human-maintained catalogs and source definitions use JSON. Generated analysis
tables use Parquet. CSV exports support review. `research.json` provides the web
application read model.

## Source archive

Each source uses this layout:

```text
research/data/sources/<source-id>/
  source.json
  crosswalk.json
  raw/<snapshot-id>/
    manifest.json
    artifacts/
  extracted/<snapshot-id>/
    observations.json
```

`source.json` identifies the publication and its artifacts. `manifest.json`
records the snapshot ID, acquisition metadata, license, redistribution status,
artifact paths, and SHA-256 checksums. `crosswalk.json` maps source labels to
canonical IDs.

The pipeline does not modify an archived artifact.

## Configuration table

One row identifies the exact settings for one reported system configuration.

```text
configuration_id
model_id
model_version
harness_id
harness_version
effort
effort_policy_id
prompt_id
tool_policy_id
retry_policy_id
timeout_s
environment_id
evaluation_date
configuration_completeness
```

The system key contains `model_id`, `harness_id`, and `effort`.
`configuration_id` does not split the system key by default.

## Observation table

One observation identifies one source row or one aggregate result.

```text
observation_id
source_id
snapshot_id
study_id
benchmark_id
benchmark_version
task_id
trial_id
configuration_id
comparison_group_id
timed_out
retry_count
failure_type
observation_granularity
source_path
source_locator_type
source_locator
```

`observation_granularity` is `trial`, `task`, or `aggregate`. `task_id` and
`trial_id` remain missing when the source does not provide that detail.

`source_locator_type` can identify a line, table row, JSON pointer, cell range,
or PDF page region. `source_locator` contains the locator value. An extractor
does not infer a value from a chart or another study.

## Measurement table

One measurement attaches one reported value to an observation.

```text
observation_id
metric_definition_id
value
precision
censoring
```

An absent measurement has no row. It does not use zero as a placeholder.

## Metric definition table

One row defines the meaning of a measurement.

```text
metric_definition_id
metric_id
direction
unit
statistic
population
denominator
accounting_basis
primary_effect_measure_id
tie_threshold_id
```

Primary quality metrics include success rate, partial score, and mean score.
Resource metrics keep different statistics and accounting bases separate.

Examples include mean time over all attempts, median time over successful
attempts, fresh tokens, total tokens, cost per attempt, and cost per success.

Two metric definitions are compatible only when they match or when a versioned
compatibility rule maps them into one analysis definition.

## Study result table

One row represents one study, comparison group, system, and metric definition.

```text
study_result_id
study_id
source_id
benchmark_id
task_family_id
family_assignment_status
comparison_group_id
independence_cluster_id
model_id
harness_id
effort
configuration_id
configuration_difference_flags
metric_definition_id
value
standard_error
interval_lower
interval_upper
n_tasks
n_trials
n_evaluated_cells
n_successes
compatibility_status
compatibility_review_id
evidence_assessment_id
evidence_grade
```

`family_assignment_status` is `primary`, `ambiguous`, or `excluded`.
`compatibility_status` is `primary`, `sensitivity_only`, `incompatible`, or
`unknown`.

## Compatibility review table

One row records a compatibility decision for one study, task family, and
metric.

```text
compatibility_review_id
study_id
task_family_id
metric_definition_id
compatibility_status
reason
policy_version
reviewer_id
reviewed_at
```

## Compatibility review domain table

One row records one domain decision in a compatibility review.

```text
compatibility_review_id
domain_id
status
reason
```

`domain_id` is `task_set`, `evaluator`, `metric`, `configuration`, or
`accounting`. `status` is `pass`, `concern`, `fail`, or `unknown`.

## Evidence assessment table

One row records the evidence grade for one study result and metric.

```text
evidence_assessment_id
study_result_id
metric_definition_id
evidence_grade
reason
policy_version
reviewer_id
reviewed_at
```

`evidence_grade` is `A`, `B`, `C`, or `D`.

## Evidence assessment domain table

One row records one domain decision in an evidence assessment.

```text
evidence_assessment_id
domain_id
status
reason
```

`domain_id` identifies one domain from [`SCORING.md`](SCORING.md#evidence-grades).
`status` is `pass`, `concern`, or `fail`.

## Local comparison table

One row represents one pairwise outcome within one study.

```text
comparison_id
study_id
comparison_group_id
independence_cluster_id
task_family_id
metric_definition_id
analysis_profile_id
model_a_id
harness_a_id
effort_a
configuration_a_id
model_b_id
harness_b_id
effort_b
configuration_b_id
value_a
value_b
outcome_a
outcome_weight
eligible
exclusion_reason
```

`outcome_a` is `1` for a win by system A, `0.5` for a tie, and `0` for a loss.

## Comparison effect table

One row represents one effect estimate for one local comparison.

```text
comparison_id
effect_measure_id
effect_a
standard_error
interval_lower
interval_upper
covariance_group_id
estimation_method
```

A positive `effect_a` always favors system A. One comparison can have more than
one effect measure.

An unavailable effect has no row. `standard_error` and interval fields remain
missing when the source does not support uncertainty estimation.
`covariance_group_id` groups estimates derived from the same multi-system study
data.

## Family score table

One row represents one system, task family, metric definition, and analysis
profile.

```text
model_id
harness_id
effort
task_family_id
metric_definition_id
analysis_profile_id
anchor_profile_id
anchor_model_id
anchor_harness_id
anchor_effort
network_component_id
method
method_version
dataset_version
beta
score
interval_lower
interval_upper
interval_status
evidence_status
reference_status
network_status
coverage_status
study_count
benchmark_count
independence_cluster_count
direct_comparisons
indirect_comparisons
bridge_count
connectivity_survival_rate
```

`method` is `weighted_bradley_terry` for method version `1.0`. `score` uses a
scale from `0` to `100` relative to the selected anchor. The status fields
follow [`SCORING.md`](SCORING.md#result-statuses).

## Pairwise probability table

One row represents one model probability within a connected component.

```text
task_family_id
metric_definition_id
analysis_profile_id
network_component_id
model_a_id
harness_a_id
effort_a
model_b_id
harness_b_id
effort_b
probability_a_beats_b
interval_lower
interval_upper
has_direct_evidence
direct_comparison_count
shortest_path_length
```

## Global score table

One row represents one system, metric, and decision profile.

```text
model_id
harness_id
effort
metric_id
analysis_profile_id
weight_profile_id
anchor_profile_id
covered_family_ids
score
interval_lower
interval_upper
interval_status
coverage
evidence_status
reference_status
network_status
coverage_status
method_version
dataset_version
```

The method does not calculate a global score when a required family is missing.

## Sensitivity result table

One row records how one planned change affects one score or comparison.

```text
sensitivity_result_id
sensitivity_profile_id
target_type
target_id
change_type
excluded_cluster_id
score_min
score_max
rank_min
rank_max
pairwise_conclusion_changed
notes
```

`target_type` identifies a family score, global score, pairwise probability, or
Pareto analysis.

## Pareto table

One row represents one system in one Pareto analysis.

```text
pareto_analysis_id
model_id
harness_id
effort
analysis_profile_id
covered_family_ids
quality_metric_id
resource_metric_id
weight_profile_id
anchor_profile_id
quality_score
resource_score
is_point_pareto
probability_non_dominated
valid_bootstrap_iterations
connectivity_survival_rate
evidence_status
reference_status
network_status
coverage_status
method_version
dataset_version
```

A separate dominance table records pairwise dominance probabilities.

## Pareto dominance table

One row represents one ordered pair in one Pareto analysis.

```text
pareto_analysis_id
model_x_id
harness_x_id
effort_x
model_y_id
harness_y_id
effort_y
probability_x_dominates_y
valid_bootstrap_iterations
```

## Network diagnostic table

One row represents one fitted network component.

```text
network_component_id
task_family_id
metric_definition_id
analysis_profile_id
node_count
edge_count
bridge_count
articulation_node_count
independence_cluster_count
connectivity_survival_rate
valid_bootstrap_iterations
diagnostic_status
```

`diagnostic_status` is `stable` or `unstable_network`.

## Public artifacts

The target build contains these files:

```text
research/build/
  configurations.parquet
  observations.parquet
  measurements.parquet
  study_results.csv
  study_results.parquet
  compatibility_reviews.parquet
  compatibility_review_domains.parquet
  evidence_assessments.parquet
  evidence_assessment_domains.parquet
  local_comparisons.parquet
  comparison_effects.parquet
  family_scores.parquet
  pairwise_probabilities.parquet
  global_scores.parquet
  sensitivity_results.parquet
  network_diagnostics.parquet
  pareto_fronts.parquet
  pareto_dominance.parquet
  research.json
  method_config.json
  manifest.json
```

`research.json` contains the web application read model. The Parquet files are
the analysis tables. `manifest.json` records source snapshots and output
checksums.
