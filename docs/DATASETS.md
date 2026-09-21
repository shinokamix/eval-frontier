# Dataset reference

This file defines the target data contract for Eval Frontier method version
`2.0`. [`SCORING.md`](SCORING.md) defines the calculation.
[`VALIDATION.md`](VALIDATION.md) defines schema and release tests. The current
implementation is described in [`research/README.md`](../research/README.md).

## Data flow

```text
source artifacts
    -> observations and measurements
    -> study results and contrasts
    -> Bayesian evidence networks
    -> posterior system and pairwise estimates
    -> decision profiles
    -> probabilistic Pareto views
```

## Contract conventions

Machine-readable JSON Schema, Pydantic, and Arrow schemas must encode the same
contract. Generated Parquet files use Arrow types. JSON uses `null` for a
missing optional value and never uses `NaN`, infinity, zero, or an empty string
as a missing-value substitute.

The tables below use these logical types:

```text
string
bool
int64
float64
date
timestamp
list<string>
json
```

Every field is required unless its description explicitly permits null. Every
table has a declared primary key. Foreign keys and enumerated values are checked
before model fitting and again before publication.

IDs are stable strings generated from canonical natural keys or declared in a
reviewed catalog. An ID cannot depend on input row order, posterior values, or
wall-clock build time.

## Contract rules

- Source snapshots are immutable.
- Every extracted record links to a location in a source artifact.
- Raw measurements and modeled estimates use separate tables.
- Missing values remain missing.
- Each metric defines direction, unit, statistic, population, denominator, and
  accounting basis.
- Each analysis metric defines a likelihood, link, effect scale, practical
  threshold, and accepted source definitions.
- Each study resolves to an `independence_cluster_id`.
- Known dependence resolves to a `covariance_group_id`.
- Reviews and policies have versions and reviewer records.
- Schema, dataset, method, and policy versions change independently.
- Posterior summaries always identify the model run that produced them.

## Storage formats

Human-maintained catalogs, mappings, and policies use JSON. Generated analysis
tables use Parquet. CSV exports support review. `research.json` is the versioned
web application read model. It contains summaries, not the full posterior.

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

`source.json` identifies the publication and artifacts. `manifest.json` records
the snapshot ID, acquisition metadata, license, redistribution status, artifact
paths, and SHA-256 checksums. `crosswalk.json` maps source labels to canonical
IDs.

The pipeline never modifies an archived artifact.

## Source and normalized data

### Configuration table

Primary key: `configuration_id`.

One row identifies the exact settings for one reported system configuration.

```text
configuration_id                 string
system_lineage_id                string
model_id                         string
model_version                    string, nullable
harness_id                       string
harness_version                  string, nullable
effort                           string, nullable
effort_policy_id                 string, nullable
prompt_id                        string, nullable
tool_policy_id                   string, nullable
retry_policy_id                  string, nullable
timeout_s                        float64, nullable
environment_id                   string, nullable
evaluation_date                  date, nullable
configuration_completeness       string
```

`configuration_completeness` is `complete`, `partial`, or `minimal`.
`system_lineage_id` resolves from `model_id`, `harness_id`, and `effort` under a
versioned identity policy.

### Observation table

Primary key: `observation_id`.

One observation identifies one trial, task result, arm summary, or published
aggregate.

```text
observation_id                   string
source_id                        string
snapshot_id                      string
study_id                         string
benchmark_id                     string
benchmark_version                string, nullable
task_id                          string, nullable
trial_id                         string, nullable
attempt_id                       string, nullable
configuration_id                 string, nullable
configuration_a_id               string, nullable
configuration_b_id               string, nullable
comparison_group_id              string
observation_granularity          string
timed_out                        bool, nullable
retry_count                      int64, nullable
failure_type                     string, nullable
source_path                      string
source_locator_type              string
source_locator                   string
```

`observation_granularity` is `trial`, `task`, `arm_aggregate`, or
`published_contrast`. Trial, task, and arm rows require `configuration_id` and
leave the two contrast configuration fields null. A published contrast requires
both contrast configuration fields and leaves `configuration_id` null. Task and
trial IDs are null only when the source does not provide that detail.

`source_locator_type` is `line`, `table_row`, `json_pointer`, `cell_range`, or
`pdf_region`. Extraction from an unlabeled chart is not eligible for
quantitative synthesis.

### Comparison group table

Primary key: `comparison_group_id`.

```text
comparison_group_id              string
study_id                         string
target_task_population_id        string
arm_configuration_ids            list<string>
missing_task_policy_id           string
task_weighting_policy_id         string
trial_aggregation_policy_id      string
retry_accounting_policy_id       string
source_path                      string
source_locator                   string
```

Every primary comparison group has at least two arms and a declared common
task population. Arm membership and task weights are fixed before inspecting
outcomes.

### Task population member table

Primary key: `target_task_population_id`, `task_id`.

```text
target_task_population_id        string
task_id                          string
weight                           float64
eligibility_status               string
exclusion_reason                 string, nullable
```

Weights for eligible tasks are positive and sum to `1` within tolerance.
Method version `2.0` uses equal task weights in the primary profile. A different
target weighting policy is a planned sensitivity analysis.

### Target task population table

Primary key: `target_task_population_id`.

```text
target_task_population_id        string
task_family_id                   string
benchmark_id                     string
inclusion_rule                   string
task_weighting_policy_id         string
missing_task_policy_id           string
policy_version                   string
```

### Measurement table

Primary key: `observation_id`, `metric_definition_id`.

One row attaches one reported measurement to an observation.

```text
observation_id                   string
metric_definition_id            string
value                            float64
precision                        float64, nullable
censoring                        string
lower_bound                      float64, nullable
upper_bound                      float64, nullable
```

`censoring` is `none`, `left`, `right`, or `interval`. Bounds are required when
the censoring value needs them. An absent measurement has no row.

### Metric definition table

Primary key: `metric_definition_id`.

One row defines the exact meaning of a source measurement.

```text
metric_definition_id            string
metric_id                        string
outcome_type                     string
direction                        string
unit                             string
statistic                        string
population                       string
denominator                      string
accounting_basis                 string
scale_lower                      float64, nullable
scale_upper                      float64, nullable
```

Method version `2.0` accepts `binary`, `bounded`, or `positive_continuous` as
`outcome_type`. Later method versions may add count or unbounded continuous
outcomes after defining their estimands and local estimators. `direction` is
`higher` or `lower`.

Definitions such as mean time over all attempts, median time over successful
attempts, fresh tokens, total tokens, cost per attempt, and cost per success are
distinct rows.

### Analysis metric table

Primary key: `analysis_metric_id`.

One row defines one modeled estimand.

```text
analysis_metric_id               string
task_family_id                   string
outcome_type                     string
direction                        string
effect_scale                     string
local_estimator_id               string
network_likelihood_family        string
link_function                    string
population                       string
denominator                      string
accounting_basis                 string
practical_threshold              float64
prior_specification_id           string
timeout_policy_id                string, nullable
method_version                   string
policy_version                   string
```

The threshold uses the declared effect scale. The analysis metric does not list
accepted source definitions directly. Versioned mapping rows provide that
relation.

### Local estimator policy table

Primary key: `local_estimator_id`.

```text
local_estimator_id               string
outcome_type                     string
arm_summary_statistic            string
trial_aggregation_policy_id      string
task_weighting_policy_id         string
missing_task_policy_id           string
bootstrap_type                   string
bootstrap_replicates             int64
finite_sample_correction         json, nullable
covariance_factorization_tolerance float64
minimum_task_clusters            int64
seed_policy_id                   string
policy_version                   string
```

The primary task-level policy uses arithmetic trial aggregation within a task,
equal weight across eligible tasks, complete paired arms, and a paired
nonparametric task-cluster bootstrap. Failed evaluations are observed outcomes,
not missing arms. Extraction failures are missing data and cannot be recoded as
task failures.

### Metric mapping table

Primary key: `metric_mapping_id`.

```text
metric_mapping_id                string
metric_definition_id            string
analysis_metric_id               string
compatibility_status             string
conversion_formula               string, nullable
rounding_policy_id               string, nullable
reason                           string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

`compatibility_status` is `primary`, `sensitivity_only`, `incompatible`, or
`unknown`. A conversion formula must be deterministic and cannot impute missing
uncertainty.

### Study result table

Primary key: `study_result_id`.

One row represents one study arm, source metric, and exact configuration.

```text
study_result_id                  string
study_id                         string
source_id                        string
snapshot_id                      string
benchmark_id                     string
task_family_id                   string
family_assignment_status         string
comparison_group_id              string
independence_cluster_id          string
covariance_group_id              string, nullable
configuration_id                 string
system_lineage_id                string
metric_definition_id            string
data_availability_status         string
summary_value                    float64, nullable
event_count                      int64, nullable
sample_size                      int64, nullable
mean                             float64, nullable
median                           float64, nullable
standard_deviation               float64, nullable
standard_error                   float64, nullable
interval_lower                   float64, nullable
interval_upper                   float64, nullable
confidence_level                float64, nullable
interval_type                   string, nullable
transformation                  string, nullable
quantiles                        json, nullable
n_tasks                          int64, nullable
n_trials                         int64, nullable
n_evaluated_cells                int64, nullable
derivation_method                string, nullable
compatibility_status             string
compatibility_review_id          string
evidence_assessment_id           string
evidence_grade                   string
```

`data_availability_status` is `task_level`, `aggregate_with_uncertainty`,
`aggregate_with_denominator`, `point_estimate_only`, or `ordinal_only`.

`family_assignment_status` is `primary`, `ambiguous`, or `excluded`.
`compatibility_status` is `primary`, `sensitivity_only`, `incompatible`, or
`unknown`. `evidence_grade` is `high`, `moderate`, `low`, or `unusable`.

The row must contain the sufficient statistics required by its availability
status. Schema validation rejects internally inconsistent combinations such as
an event count greater than sample size.

An interval used to derive uncertainty requires `confidence_level`,
`interval_type`, and any transformation needed to recover the analysis scale.

## Reviews and synthesis inputs

### Analysis-system mapping table

Primary key: `analysis_profile_id`, `configuration_id`, `analysis_metric_id`.

```text
analysis_profile_id              string
configuration_id                 string
analysis_metric_id               string
analysis_system_id               string, nullable
configuration_action             string
adjustment_design_id             string, nullable
reason                           string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

`configuration_action` is `pool`, `adjust`, `split_node`, or `exclude`.
`analysis_system_id` is null only for `exclude`.

An `adjust` action is valid only when the registered design-matrix and overlap
checks pass. Otherwise the policy must split or exclude the configuration.

### Adjustment covariate table

Primary key: `adjustment_design_id`, `covariate_id`.

```text
adjustment_design_id             string
covariate_id                     string
value_type                       string
coding_scheme                    string
reference_level                  string, nullable
allowed_values                   json, nullable
prior_specification_id           string
```

### Adjustment covariate value table

Primary key: `adjustment_design_id`, `configuration_id`, `covariate_id`.

```text
adjustment_design_id             string
configuration_id                 string
covariate_id                     string
numeric_value                    float64, nullable
categorical_value                string, nullable
```

Exactly one value field is non-null. The pipeline materializes a deterministic
design matrix from these tables and stores its rank and overlap diagnostics.

### Effect-modifier definition table

Primary key: `effect_modifier_id`.

```text
effect_modifier_id              string
name                            string
value_type                      string
unit                            string, nullable
allowed_values                  json, nullable
missing_value_policy            string
policy_version                  string
```

### Effect-modifier value table

Primary key: `effect_modifier_value_id`.

```text
effect_modifier_value_id        string
study_id                        string
comparison_group_id             string
scope                           string
configuration_id                string, nullable
effect_modifier_id              string
numeric_value                   float64, nullable
categorical_value               string, nullable
source_path                     string
source_locator                  string
```

Exactly one value field is non-null. `scope` is `study`, `comparison_group`, or
`arm`; arm scope requires `configuration_id`, while the other scopes leave it
null. The registered transitivity policy names the required modifiers, their
scope, and balance checks for each task family. Configuration fields can supply
arm modifiers only through an explicit versioned mapping rule.

### Independence cluster table

Primary key: `independence_cluster_id`.

```text
independence_cluster_id          string
overlap_type                     string
grouping_reason                  string
primary_report_study_id          string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

### Independence cluster member table

Primary key: `independence_cluster_id`, `study_id`, `snapshot_id`.

```text
independence_cluster_id          string
study_id                         string
snapshot_id                      string
member_role                      string
shared_task_rule                 string, nullable
shared_run_rule                  string, nullable
```

`member_role` is `primary_report`, `complementary_report`, or
`alternate_report`. These rows drive deduplication, primary-report selection,
and leave-one-cluster-out analysis.

### Compatibility review table

Primary key: `compatibility_review_id`.

```text
compatibility_review_id          string
study_id                         string
task_family_id                   string
analysis_metric_id               string
compatibility_status             string
reason                           string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

### Compatibility review domain table

Primary key: `compatibility_review_id`, `domain_id`.

```text
compatibility_review_id          string
domain_id                        string
status                           string
reason                           string
```

`domain_id` is `task_set`, `evaluator`, `metric`, `configuration`,
`accounting`, or `transitivity`. `status` is `pass`, `concern`, `fail`, or
`unknown`.

### Evidence assessment table

Primary key: `evidence_assessment_id`.

```text
evidence_assessment_id           string
study_result_id                  string
analysis_metric_id               string
evidence_grade                   string
reason                           string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

### Evidence assessment domain table

Primary key: `evidence_assessment_id`, `domain_id`.

```text
evidence_assessment_id           string
domain_id                        string
status                           string
reason                           string
```

`domain_id` is `provenance`, `configuration_completeness`,
`task_evaluator_comparability`, `sample_replication`, `metric_validity`, or
`independence`. `status` is `pass`, `concern`, or `fail`.

### Synthesis unit table

Primary key: `synthesis_unit_id`.

```text
synthesis_unit_id                string
independence_cluster_id          string
member_study_ids                 list<string>
construction_method              string
primary_report_study_id          string
policy_version                   string
```

One synthesis unit emits one contrast vector and sampling covariance block for
the network likelihood. Different units in one fit must be independent.

### Effect measure table

Primary key: `effect_measure_id`.

```text
effect_measure_id                string
analysis_metric_id               string
effect_scale                     string
orientation_rule                 string
contrast_formula                 string
method_version                   string
```

Each analysis metric has one primary effect measure in method version `2.0`.

### Study contrast table

Primary key: `contrast_id`, `effect_measure_id`.

One row stores a reported or derived within-study contrast for audit and for
contrast-level likelihoods.

```text
contrast_id                      string
synthesis_unit_id                string
study_id                         string
comparison_group_id              string
independence_cluster_id          string
covariance_group_id              string, nullable
task_family_id                   string
analysis_metric_id               string
analysis_profile_id              string
local_reference_analysis_system_id string
contrast_order                   int64
analysis_system_a_id             string
configuration_a_id               string
analysis_system_b_id             string
configuration_b_id               string
effect_measure_id                string
effect_a                         float64
standard_error                   float64, nullable
interval_lower                   float64, nullable
interval_upper                   float64, nullable
confidence_level                float64, nullable
interval_type                   string, nullable
transformation                  string, nullable
estimation_method                string
target_task_population_id        string
sampling_covariance_method       string
data_availability_status         string
eligibility_status               string
exclusion_reason                 string, nullable
```

A positive `effect_a` always favors system A. System A and B use lexical order
of `analysis_system_id` so the same contrast cannot appear twice with reversed
orientation.

Within one synthesis unit, every outcome uses the same local reference.
`contrast_order` is unique and contiguous from zero. It fixes the stack by arm
and then outcome for the covariance and Kronecker formulas.

`eligibility_status` is `primary`, `sensitivity_only`, or `excluded`.

### Contrast covariance table

Primary key: `covariance_group_id`, `row_contrast_id`, `row_effect_measure_id`,
`column_contrast_id`, `column_effect_measure_id`.

```text
covariance_group_id              string
row_contrast_id                  string
row_effect_measure_id            string
column_contrast_id               string
column_effect_measure_id         string
covariance                       float64
row_effect_scale                 string
column_effect_scale              string
estimation_method                string
source_path                      string, nullable
source_locator                   string, nullable
```

The table stores every diagonal variance and both directions of every nonzero
off-diagonal element. Each group must form a symmetric positive-semidefinite
matrix within the configured numerical tolerance. A covariance group ID alone
does not make a contrast eligible.

Every primary contrast belongs to a covariance group with its diagonal
variance present. `covariance_group_id` can be null only for an excluded result
that never enters a model.

## Model configuration and output

### Configuration profile catalogs

The following catalogs live in `method_config.json`. They use the same required
field, foreign-key, and enum rules as generated tables.

An analysis profile contains:

```text
analysis_profile_id
allowed_evidence_grades
allowed_family_assignment_statuses
allowed_data_availability_statuses
allowed_configuration_actions
exclusion_rule_ids
policy_version
```

An anchor profile contains one entry per task family and analysis metric:

```text
anchor_profile_id
task_family_id
analysis_metric_id
anchor_analysis_system_id
missing_anchor_policy
policy_version
```

A decision profile and its cells contain:

```text
decision_profile_id
required_task_family_ids
family_weighting_policy_id
coverage_rule_id
decision_threshold
candidate_policy_id
correlation_policy_id
cross_family_draw_policy_id
policy_version

decision_profile_id
analysis_metric_id
axis_role
weight
value_function_id
required
```

`axis_role` is `quality`, `resource`, or `utility`. Method version `2.0`
uses `equal_task_family` as its family weighting policy. Each required family
has raw weight `1` and normalized weight `1 / F`, where `F` is the number of
required families. Cell weights sum to `1` within each family and configured
aggregation. Every profile that emits joint output names one joint model run
per required family and a cross-family draw policy.

A sensitivity profile contains:

```text
sensitivity_profile_id
base_analysis_profile_id
change_type
configuration_patch
required
conclusion_rule_id
policy_version
```

The configuration also catalogs value functions, priors, status precedence,
publication rules, and candidate policies by stable ID. Schema validation
rejects an output that references an absent catalog entry.

### Model run table

Primary key: `model_run_id`.

```text
model_run_id                     string
task_family_id                   string
analysis_metric_ids              list<string>
analysis_profile_id              string
network_component_ids            list<string>
correlation_assumption_id        string, nullable
method                           string
method_version                   string
dataset_version                  string
policy_version                   string
config_checksum                  string
code_revision                    string
started_at                       timestamp
completed_at                     timestamp, nullable
fit_status                       string
failure_reason                   string, nullable
posterior_draw_count             int64
```

`method` is `bayesian_hierarchical_network_meta_analysis`. `fit_status` is
`passed`, `failed_diagnostics`, `failed_sampling`, or `not_estimable`.
One model run uses one estimated or fixed correlation matrix. Every matrix in a
correlation sensitivity set creates a separate `model_run_id`; sensitivity
results link those runs rather than mixing draws under one ID.

### Posterior system draw table

Primary key: `model_run_id`, `draw_id`, `analysis_metric_id`,
`analysis_system_id`.

```text
model_run_id                     string
draw_id                          int64
analysis_metric_id               string
analysis_system_id               string
computational_reference_analysis_system_id string
relative_effect                  float64
```

Multivariate model runs include one row per outcome and system for every draw.
Decision utilities use a separate draw table.

### Model parameter draw table

Primary key: `model_run_id`, `draw_id`, `parameter_id`.

```text
model_run_id                     string
draw_id                          int64
parameter_id                     string
parameter_type                   string
analysis_metric_a_id             string
analysis_metric_b_id             string, nullable
covariate_id                     string, nullable
value                            float64
```

`parameter_type` is `heterogeneity_tau`, `outcome_correlation`, or
`configuration_coefficient`. Correlation rows identify both metrics.

### Model parameter estimate table

Primary key: `model_run_id`, `parameter_id`.

```text
model_run_id                     string
parameter_id                     string
parameter_type                   string
posterior_mean                   float64
posterior_median                 float64
posterior_sd                     float64
interval_lower                   float64
interval_upper                   float64
prior_to_posterior_information_gain float64, nullable
identification_status            string
```

These tables store `tau`, `Omega`, and configuration coefficients independently
of system estimates. Correlation identification uses the recorded information
gain and the configured threshold.

### System estimate table

Primary key: `model_run_id`, `analysis_metric_id`, `analysis_system_id`,
`anchor_profile_id`.

```text
model_run_id                     string
analysis_metric_id               string
analysis_system_id               string
anchor_profile_id                string
anchor_analysis_system_id        string
computational_reference_analysis_system_id string
anchor_relative_effect_mean      float64
anchor_relative_effect_median    float64
anchor_relative_effect_sd        float64
anchor_relative_interval_lower   float64
anchor_relative_interval_upper   float64
preference_score                 float64
estimation_status                string
evidence_status                  string
consistency_status               string
stability_status                 string
reference_status                 string
coverage_status                  string
correlation_status               string
study_count                      int64
benchmark_count                  int64
independence_cluster_count       int64
direct_comparison_count          int64
bridge_count                     int64
```

### Pairwise estimate table

Primary key: `model_run_id`, `analysis_metric_id`, `analysis_system_a_id`,
`analysis_system_b_id`.

```text
model_run_id                     string
analysis_metric_id               string
analysis_system_a_id             string
analysis_system_b_id             string
posterior_mean_a_minus_b         float64
posterior_median_a_minus_b       float64
posterior_sd                     float64
interval_lower                   float64
interval_upper                   float64
probability_a_better             float64
probability_equivalent           float64
probability_b_better             float64
has_direct_evidence              bool
direct_study_count               int64
direct_independence_clusters     int64
shortest_path_length             int64
indirect_path_count              int64
estimation_status                string
evidence_status                  string
consistency_status               string
stability_status                 string
```

System A and B use lexical order. The three probabilities must sum to `1`
within the published numerical tolerance. A separate network-path artifact may
list each indirect path when the interface needs more than its count.

## Decision output

### Decision-system table

Primary key: `decision_system_id`.

```text
decision_system_id               string
system_lineage_id                string
display_name                     string
identity_policy_id               string
```

A decision system is the stable entity shown across quality and resource
metrics. It prevents the decision layer from assuming that metric-specific
analysis nodes share IDs.

### Decision-system mapping table

Primary key: `decision_profile_id`, `analysis_metric_id`,
`analysis_system_id`.

```text
decision_profile_id              string
analysis_metric_id               string
analysis_system_id               string
decision_system_id               string
mapping_status                   string
reason                           string
policy_version                   string
reviewer_id                      string
reviewed_at                      timestamp
```

`mapping_status` is `matched`, `excluded`, or `ambiguous`. Only `matched` rows
can enter a decision or Pareto calculation.

### Decision run table

Primary key: `decision_run_id`.

```text
decision_run_id                  string
joint_model_run_ids              list<string>
decision_profile_id              string
anchor_profile_id                string
family_weighting_policy_id       string
cross_family_draw_policy_id      string
method_version                   string
dataset_version                  string
policy_version                   string
config_checksum                  string
fit_status                       string
failure_reason                   string, nullable
posterior_draw_count             int64
```

`fit_status` is `passed`, `failed_inputs`, `failed_joint_model`, or
`insufficient_coverage`.

The model runs cover the same required task families as the decision profile.
The cross-family draw policy defines how the decision run combines their
posterior draws.

### Decision family utility draw table

Primary key: `decision_run_id`, `draw_id`, `decision_system_id`,
`task_family_id`.

```text
decision_run_id                  string
draw_id                          int64
decision_system_id               string
task_family_id                   string
family_weight                    float64
quality_utility                  float64, nullable
resource_utility                 float64, nullable
total_utility                    float64, nullable
```

`family_weight` equals `1 / F` for every required family. These rows preserve
the family contributions used to calculate each global draw.

### Decision utility draw table

Primary key: `decision_run_id`, `draw_id`, `decision_system_id`.

```text
decision_run_id                  string
decision_profile_id              string
anchor_profile_id                string
draw_id                          int64
decision_system_id               string
quality_utility                  float64, nullable
resource_utility                 float64, nullable
total_utility                    float64, nullable
resource_ratio                   float64, nullable
quality_coordinate               float64, nullable
resource_coordinate              float64, nullable
```

For Pareto output, `resource_coordinate` is the higher-is-better
`resource_efficiency`, equal to `1 / resource_ratio`. The ratio remains in the
table for display and audit.

### Decision candidate table

Primary key: `decision_run_id`, `decision_system_id`.

```text
decision_run_id                  string
decision_system_id               string
candidate_status                 string
exclusion_reason                 string, nullable
```

The table fixes the systems used for probability-best, ranks, and expected
regret. `candidate_status` is `included` or `excluded`.

### Decision score table

Primary key: `decision_run_id`, `decision_system_id`.

```text
decision_run_id                  string
decision_profile_id              string
anchor_profile_id                string
decision_system_id               string
covered_family_ids               list<string>
utility_mean                     float64
utility_median                   float64
utility_interval_lower           float64
utility_interval_upper           float64
expected_regret                  float64
probability_best                 float64
rank_distribution               json
evidence_status                  string
consistency_status               string
stability_status                 string
reference_status                 string
coverage_status                  string
correlation_status               string
method_version                   string
dataset_version                  string
```

Expected regret is `E[max_j Utility_j - Utility_i]` over the declared candidate
set. The method does not calculate a decision score when required coverage is
missing.

### Sensitivity result table

Primary key: `sensitivity_result_id`.

```text
sensitivity_result_id            string
sensitivity_profile_id           string
target_type                      string
target_id                        string
change_type                      string
excluded_study_id                string, nullable
excluded_cluster_id              string, nullable
primary_value                    float64, nullable
sensitivity_value                float64, nullable
interval_lower                   float64, nullable
interval_upper                   float64, nullable
conclusion_changed               bool
fit_status                       string
notes                            string, nullable
```

`target_type` is `system_estimate`, `pairwise_estimate`, `decision_score`, or
`pareto_analysis`.

## Pareto output

### Pareto analysis table

Primary key: `pareto_analysis_id`.

```text
pareto_analysis_id               string
decision_run_id                  string
analysis_profile_id              string
decision_profile_id              string
anchor_profile_id                string
quality_axis_definition          json
resource_axis_definition         json
quality_threshold                float64
resource_threshold               float64
candidate_policy_id              string
correlation_policy_id            string
usable_posterior_draws           int64
publication_status               string
```

### Pareto candidate table

Primary key: `pareto_analysis_id`, `decision_system_id`.

```text
pareto_analysis_id               string
decision_system_id               string
candidate_status                 string
exclusion_reason                 string, nullable
```

`candidate_status` is `included` or `excluded`. The table freezes the candidate
universe so adding a system cannot silently change a published probability.

### Pareto result table

Primary key: `pareto_analysis_id`, `decision_system_id`.

```text
pareto_analysis_id               string
decision_run_id                  string
decision_system_id               string
covered_family_ids               list<string>
quality_summary_statistic        string
resource_summary_statistic       string
quality_value                    float64
resource_value                   float64
quality_interval_lower           float64
quality_interval_upper           float64
resource_interval_lower          float64
resource_interval_upper          float64
joint_region                     json, nullable
is_point_pareto                  bool
probability_non_dominated        float64, nullable
usable_posterior_draws           int64
evidence_status                  string
consistency_status               string
stability_status                 string
reference_status                 string
coverage_status                  string
correlation_status               string
method_version                   string
dataset_version                  string
```

### Pareto dominance table

Primary key: `pareto_analysis_id`, `decision_system_x_id`,
`decision_system_y_id`.

```text
pareto_analysis_id               string
decision_system_x_id             string
decision_system_y_id             string
probability_x_dominates_y        float64
probability_y_dominates_x        float64
probability_neither_dominates     float64
usable_posterior_draws           int64
```

The three probabilities must sum to `1` within tolerance.

## Diagnostics and publication decisions

### Publication impact decision table

Primary key: `publication_impact_decision_id`.

```text
publication_impact_decision_id   string
target_type                      string
target_id                        string
failed_check_id                  string
decision                         string
reason                           string
reviewer_id                      string
reviewed_at                      timestamp
policy_version                   string
```

`decision` is `block`, `publish_labeled`, or `not_applicable`. The method
configuration declares which failed checks permit each decision.

### Model diagnostic table

Primary key: `model_run_id`, `diagnostic_id`.

```text
model_run_id                     string
diagnostic_id                    string
diagnostic_type                  string
target_id                        string, nullable
value                            float64, nullable
threshold                        float64, nullable
status                           string
details                          json, nullable
```

Diagnostic types include convergence, effective sample size, divergence,
posterior predictive fit, residual fit, heterogeneity, inconsistency,
effect-modifier balance, influence, holdout prediction, and prior sensitivity.

`status` is `pass`, `concern`, `fail`, or `not_testable`.

### Network diagnostic table

Primary key: `model_run_id`, `analysis_metric_id`, `network_component_id`.

```text
model_run_id                     string
analysis_metric_id               string
network_component_id             string
node_count                       int64
edge_count                       int64
cycle_count                      int64
bridge_count                     int64
articulation_node_count          int64
independence_cluster_count       int64
direct_indirect_check_count      int64
estimation_status                string
consistency_status               string
stability_status                 string
```

## Public artifacts

The target build contains:

```text
research/build/
  schemas/
    research.schema.json
    method-config.schema.json
    table-schemas.json
  configurations.parquet
  observations.parquet
  comparison_groups.parquet
  target_task_populations.parquet
  task_population_members.parquet
  measurements.parquet
  metric_definitions.parquet
  analysis_metrics.parquet
  local_estimator_policies.parquet
  metric_mappings.parquet
  effect_modifier_definitions.parquet
  effect_modifier_values.parquet
  independence_clusters.parquet
  independence_cluster_members.parquet
  study_results.csv
  study_results.parquet
  analysis_system_mappings.parquet
  adjustment_covariates.parquet
  adjustment_covariate_values.parquet
  compatibility_reviews.parquet
  compatibility_review_domains.parquet
  evidence_assessments.parquet
  evidence_assessment_domains.parquet
  synthesis_units.parquet
  effect_measures.parquet
  study_contrasts.parquet
  contrast_covariances.parquet
  model_runs.parquet
  posterior_system_draws.parquet
  model_parameter_draws.parquet
  model_parameter_estimates.parquet
  system_estimates.parquet
  pairwise_estimates.parquet
  decision_systems.parquet
  decision_system_mappings.parquet
  decision_runs.parquet
  decision_candidates.parquet
  decision_family_utility_draws.parquet
  decision_utility_draws.parquet
  decision_scores.parquet
  sensitivity_results.parquet
  model_diagnostics.parquet
  network_diagnostics.parquet
  pareto_analyses.parquet
  pareto_candidates.parquet
  pareto_results.parquet
  pareto_dominance.parquet
  publication_impact_decisions.parquet
  research.json
  method_config.json
  manifest.json
```

`research.json` contains the application read model. It identifies its schema,
dataset, method, and policy versions. Parquet files contain analysis tables and
posterior draws. `manifest.json` records source snapshots, configuration and
code revisions, artifact checksums, fit status, and publication timestamp.
