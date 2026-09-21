# Scoring method reference

This reference defines scoring method version `2.0`. The method consumes the
tables from [`DATASETS.md`](DATASETS.md). [`METHODOLOGY.md`](METHODOLOGY.md)
explains the design choices. [`VALIDATION.md`](VALIDATION.md) defines the
publication gates.

## Method summary

The primary method is Bayesian hierarchical random-effects network
meta-analysis. It fits observed effect magnitudes and their uncertainty. It
does not convert source values into wins, ties, or losses before fitting.

The calculation has four stages:

1. Resolve compatible study arms and analysis-system nodes.
2. Fit one evidence network for each task family, analysis metric, and analysis
   profile.
3. Derive pairwise and anchor-relative posterior summaries.
4. Apply decision profiles to posterior draws and calculate probabilistic
   Pareto results.

## Identifiers

The method uses these identifiers:

- `system_lineage_id` contains `model_id`, `harness_id`, and `effort`.
- `configuration_id` identifies exact run settings.
- `analysis_system_id` identifies a pooled or split node used in one model.
- `comparison_group_id` identifies study arms tested under shared conditions.
- `independence_cluster_id` groups reused tasks, runs, or derived results.
- `covariance_group_id` groups outcomes with known or suspected dependence.
- `metric_definition_id` identifies the exact source measurement.
- `analysis_metric_id` identifies one modeled estimand and its likelihood.
- `analysis_profile_id` identifies primary or sensitivity inputs.
- `model_run_id` identifies one fitted model and configuration checksum.
- `network_component_id` identifies one connected component.
- `anchor_profile_id` selects presentation anchors.
- `decision_profile_id` selects value functions, weights, and coverage rules.

## Analysis profiles

The primary profile includes a study result when all these conditions hold:

- `compatibility_status` is `primary`.
- `evidence_grade` is `high` or `moderate`.
- `family_assignment_status` is `primary`.
- `data_availability_status` is `task_level`,
  `aggregate_with_uncertainty`, or `aggregate_with_denominator`.
- A versioned rule maps its metric definition to the selected analysis metric.
- Its configuration action is `pool`, `adjust`, or `split_node`.
- It has no applicable exclusion.

A `point_estimate_only` result becomes eligible only when a versioned rule can
reconstruct sufficient statistics and bound the effect of published rounding.
The normalized result then records the derived availability status and
derivation method. `ordinal_only` results never enter a model.

A sensitivity profile lists every difference from the primary profile. No
unplanned input change is allowed during interpretation.

## Analysis metric definitions

Each `analysis_metric_id` declares:

```text
task_family_id
outcome_type
direction
effect_scale
local_estimator_id
network_likelihood_family
link_function
population
denominator
accounting_basis
practical_threshold
accepted_metric_definition_ids
prior_specification_id
```

The compatibility rule also declares any deterministic unit conversion. A rule
cannot map measurements with different statistics, populations, denominators,
or accounting bases unless the method configuration supplies a justified model
for that difference.

## Analysis-system resolution

The configuration policy assigns one action to every material difference:

- `pool` maps configurations to one `analysis_system_id`.
- `adjust` maps them to one node and emits declared covariates.
- `split_node` maps them to separate nodes.
- `exclude` removes the result from the selected profile.

The pipeline resolves nodes before building the graph. Node resolution is
versioned and deterministic. A model never changes node identity in response to
the observed outcome.

An `adjust` action is allowed only when the registered contrast design matrix
has full column rank for the requested coefficients and the configured overlap
rule passes. Each adjusted configuration level must appear in enough
independent comparison groups and cannot be perfectly confounded with system
identity or study. Failed checks force `split_node` or `exclude`; priors do not
rescue an unidentified adjustment.

## Network construction

The method builds a separate graph for each task family, analysis metric, and
analysis profile. Analysis systems are nodes. An eligible multi-system
comparison group creates edges among its nodes.

Connected components are found before fitting. Components are fitted
separately. Bridges, articulation nodes, direct comparison counts, and shortest
paths are recorded.

Before fitting, the pipeline joins normalized effect-modifier values and runs
the task family's registered transitivity checks. Required modifiers, missing
value handling, balance statistics, and thresholds live in the method
configuration. The check assigns eligibility to whole comparison groups before
the graph is built. A failed or unknown required modifier excludes that group's
edges from the primary profile, then the pipeline recomputes connected
components. A pair-specific question that needs a different exclusion creates a
separate analysis profile and fit. The method never marks an indirect path
invalid after allowing its edges to estimate the shared network effects.

A connected component with one node or no eligible contrast is
`not_estimable`.

## Common marginal estimand

The network model consumes study-level marginal contrasts. It does not assign
one shared coefficient to conditional task-level odds and marginal aggregate
odds.

Each analysis metric defines a target task population and a marginal arm
summary. Examples are success probability over the study's sampled tasks,
normalized arithmetic mean score, and arithmetic mean cost or elapsed time per
attempt. Every local estimator must target that declared summary before its
contrast enters the evidence network.

Task-level observations and aggregates derived from those observations are
alternative representations of the same evidence. The input resolver selects
one representation per study, arm, and metric. It never includes both.

## Local contrast estimation

For every eligible comparison group, the local stage emits a contrast vector
`y[s]` and its sampling covariance matrix `S[s]`. System A and B are oriented so
positive effects favor A. The estimator ID, target population, effect scale,
rounding rule, and covariance method are stored with the contrasts.

Task-level estimators resample or model tasks as clusters and keep all systems
and trials for one sampled task together. Repeated trials of one task do not
increase the effective task count as if they were new tasks.

The default target population gives each distinct eligible task equal weight.
Within a task and arm, the estimator first averages repeated trials. It then
averages those task summaries. A comparison group must declare the common task
set, its missing-task rule, and any non-uniform target weights before observing
outcomes. Complete-case selection or outcome-dependent weights are not allowed
in the primary profile.

The primary policy requires a complete arm grid over the declared task set. An
evaluation failure is a measured unsuccessful trial and retains its consumed
resource. A missing extraction or an arm that was never run is missing data,
not a failure. Such a group stays outside the primary profile unless a later
registered missing-data estimator applies. Retries are included only through
the comparison group's fixed retry-accounting policy. The primary bootstrap
draws the declared number of task IDs with replacement using the registered
seed, retains every arm and trial attached to each draw, recomputes within-task
arm summaries, and then recomputes the full contrast vector. The policy stores
the number of replicates and minimum distinct-task count.

Aggregate estimators use reported counts, standard errors, quantiles, or
covariance. When the required sampling covariance cannot be reconstructed, the
result is not eligible for a primary multi-system or multi-outcome fit.

## Binary quality contrasts

The default binary effect is the marginal log odds ratio over the declared task
population:

```text
effect_ab = logit(success_probability_a)
          - logit(success_probability_b)
```

For task-level data, the primary local estimator uses a paired task-cluster
bootstrap. Every bootstrap sample draws tasks with replacement and retains all
arms and trials for each selected task. It produces the full covariance matrix
for all study contrasts. Let `p_bar` be the equal-task-weighted arm success
mean and `n_tasks` the number of eligible tasks. At a zero or one boundary, the
default empirical logit replaces it with
`(n_tasks * p_bar + 0.5) / (n_tasks + 1)` in every resample. This preserves task
rather than attempt weighting. The original-sample point contrast `y[s]` uses
the same corrected empirical logit. It is not the mean or median bootstrap
contrast. The uncorrected estimand remains the target. Required sensitivity
fits use constants `0.25` and `1.0` in place of `0.5` and record any conclusion
change.

For aggregate independent-arm counts, the estimator uses the registered
log-odds-ratio formula and delta-method sampling variance. Aggregate sources
with repeated tasks are eligible only when they report a cluster-robust
variance, effective task count, or enough detail to reconstruct one. Otherwise
they are `point_estimate_only` for this analysis metric.

The local report records both attempt count and distinct task count. Evidence
status uses distinct tasks and independent campaigns, not attempts alone.

## Bounded score contrasts

A bounded score is mapped linearly to `[0, 1]` using its declared bounds. The
default effect is the marginal arithmetic mean difference on that normalized
scale:

```text
effect_ab = mean_score_a - mean_score_b
```

Task-level sampling covariance uses the paired task-cluster bootstrap.
Aggregate means require a reported or reconstructable standard error. A
nonlinear transform requires a registered estimator that also transforms its
sampling covariance.

Binary success and bounded score remain separate analysis metrics. Count and
unbounded continuous outcomes are outside method version `2.0` unless a later
method version defines their estimands and local estimators.

## Resource contrasts

Primary resource metrics target arithmetic expected resource per attempt. The
default effect is the log ratio of arithmetic means:

```text
effect_ab = log(mean_resource_b / mean_resource_a)
```

A positive value favors system A because lower resource use is better. This is
not the difference of mean log resource and does not estimate a geometric-mean
ratio.

Task-level sampling covariance uses the paired task-cluster bootstrap over the
arithmetic arm means. Aggregate means require arm sample sizes and standard
deviations, a reported contrast standard error, or an equivalent registered
variance. The delta method propagates uncertainty to the log-ratio scale.

Median and quantile resource summaries remain distinct source metric
definitions but are outside method version `2.0`. They cannot map to an
arithmetic-mean analysis metric.

Operational per-attempt resource includes the actual resource consumed by a
failed or timed-out attempt. A timeout recorded at its real elapsed or billed
resource is an observed value. An analysis of latent time to completion instead
requires a later method version with a registered survival estimand. Method
version `2.0` does not fit latent right-censored resource outcomes. It retains
them in the evidence view unless the source reports the actual resource
consumed at termination. Dropping timeouts is never a primary policy.

Cost, time, or tokens per success are outside method version `2.0`. Relative
contrast networks do not identify the absolute success probability and
absolute resource baseline needed for that calculation. A source-reported
per-success value remains in the evidence view and cannot map to a per-attempt
analysis metric. A later method version must define absolute baselines and each
supported finite or adaptive retry policy before publishing these views.

## Published contrasts

A published contrast enters the primary model only when it supplies a standard
error or a covariance matrix on the declared effect scale. Confidence
intervals can supply a standard error only when confidence level, interval
type, transformation, and derivation rule are known.

The source must identify both configurations. A transformed contrast records
its original effect, transformation, and uncertainty propagation method.

## Network contrast likelihood

For study `s`, let `y[s]` contain its local contrasts against a declared local
reference arm. Let `S[s]` be their sampling covariance matrix. The implementation
uses the random-effects model after analytically integrating the study random
effect:

```text
y[s] ~ MultivariateNormal(
    X[s] * d + Z[s] * gamma,
    S[s] + H[s]
)
```

`X[s] * d` maps population-average system effects to the observed contrasts.
`Z[s] * gamma` contains identifiable configuration adjustments. `S[s]`
contains sampling covariance. `H[s]` contains between-study heterogeneity.
These matrices are stored and diagnosed separately.

The primary profile requires `S[s]` to be positive definite. When the local
estimator is the task-cluster bootstrap, it also requires more distinct task
clusters than the dimension of the emitted contrast vector. A rank-deficient
bootstrap matrix means that sampling uncertainty is not
identified in every modeled direction; between-study heterogeneity cannot
replace it. Such a vector remains in the evidence view but does not enter a
primary or fixed-effect network fit. A later sensitivity profile may name a
validated shrinkage estimator, but its output cannot replace the primary fit.
Published or aggregate covariance does not need a task count when it is
positive definite, has complete provenance, and comes from an accepted
cluster-robust or reported covariance method.
The implementation uses a symmetric eigendecomposition check with the
configured relative tolerance. It may add numerical diagonal jitter no larger
than that tolerance times the largest diagonal element and must record it. A
larger correction, a non-positive diagonal, or a failed factorization excludes
the vector.

For a homogeneous multi-system random-effects model, `H[s]` has `tau^2` on the
diagonal and `tau^2 / 2` between contrasts sharing one local reference arm.
That rule does not define sampling covariance, task pairing, reused-run
dependence, or cross-outcome correlation.

`tau` is estimated separately for each task family and analysis metric unless a
registered multivariate heterogeneity model says otherwise.

## Related studies and covariance groups

Exact duplicate runs appear once in the likelihood. Complementary reports from
one campaign are merged before fitting into one `synthesis_unit_id`. The index
`s` in the network likelihood refers to this synthesis unit, not necessarily
one publication's `study_id`.

Known overlap in tasks, runs, or outcomes uses a covariance group. When the
covariance can be reconstructed, the unit stacks every retained contrast into
one vector and its block sampling matrix. This includes covariance across
reports. When it cannot, the primary profile selects the most complete report
and sensitivity profiles substitute the alternatives. Separate synthesis units
must be independent under the registered cluster review.

The model never assumes that two publications from one campaign are independent
merely because they have different `study_id` values.

## Multivariate outcome model

When the same study arms report several outcomes, their local contrast vectors
are stacked. The sampling matrix contains covariance across both arms and
outcomes. The random-effects matrix models between-study covariance across
outcomes:

```text
y_multi[s] ~ MultivariateNormal(
    X_multi[s] * d_multi + Z_multi[s] * gamma_multi,
    S_multi[s] + H_multi[s]
)
```

Task-level paired observations estimate `S_multi[s]` through the joint task
bootstrap. Published aggregates require reported covariance or a registered
correlation sensitivity set. A covariance-group label without matrix values is
not sufficient.

The primary multivariate profile requires a complete arm-by-outcome grid for
all metrics required by the decision profile. A study with a missing required
arm outcome can still enter the corresponding univariate networks but cannot
enter that joint fit. Method version `2.0` does not impute the cell or select an
outcome-dependent submatrix.

Configuration coefficients are outcome-specific. For outcome `k` and
covariate `c`, `gamma_multi[k,c]` has the configured prior for that outcome's
effect scale. `Z_multi` is block diagonal by outcome and repeats the declared
arm-level covariate coding within that outcome. Sharing a configuration
coefficient across outcomes requires a later method version.

`H_multi` uses a Cholesky parameterization and a configured LKJ prior for its
correlation matrix.

For `K` outcomes and `J - 1` contrasts against one local reference arm, order
the stacked vector by arm and then outcome. Method version `2.0` uses:

```text
Sigma_outcome = diag(tau[1:K]) * Omega * diag(tau[1:K])
H_multi[s] = R_arm[J - 1] kronecker Sigma_outcome
```

`Omega` is the between-study outcome correlation matrix. `R_arm` has `1` on
the diagonal and `0.5` off the diagonal for contrasts that share the local
reference arm. It follows that same-outcome shared-reference covariance is
`tau[k]^2 / 2`, same-contrast cross-outcome covariance is
`tau[k] * tau[l] * Omega[k,l]`, and shared-reference cross-outcome covariance
is half that value. Outcomes have separate heterogeneity scales and share
`Omega`. A later method version is required for outcome-specific arm
correlation structures.

The output assigns one `correlation_status`:

- `estimated` means network evidence materially updated the correlation prior.
- `prior_dominated` means a joint model fitted but the data did not identify the
  correlation well.
- `assumed` means every published result is repeated over the registered
  correlation sensitivity set.
- `unavailable` means only marginal models were fitted. No posterior
  non-domination probability is published in that state.

The prior-to-posterior change used for this classification is recorded by the
model diagnostics. A versioned `correlation_identification_policy_id` defines
the minimum independent-cluster count and prior-to-posterior information gain
required for `estimated`. Failing either threshold produces
`prior_dominated`; the implementation does not make this judgment manually.

## Joint-draw requirement

Method version `2.0` does not couple draws from separately fitted marginal
models. Decision utility, expected regret, joint credible regions, and
probabilistic Pareto results require draws from one fitted multivariate model.
A model can repeat a registered set of fixed cross-outcome correlations for
aggregate evidence, but each sensitivity fit must itself generate joint draws.
If no joint fit exists, `correlation_status` is `unavailable` and these joint
outputs are omitted.

## Priors

Every prior is part of `method_config.json`. Defaults apply on the model's link
scale:

```text
binary log-odds system effect       Normal(0, 1.5)
bounded mean-difference effect      Normal(0, 0.35)
log-resource system effect          Normal(0, 1.0)
configuration coefficient          Normal(0, 0.5)
heterogeneity tau                   HalfNormal(0, 0.5)
correlation matrix                  LKJ(2)
```

Continuous outcomes without a standard link scale must declare calibrated
priors in the analysis metric definition.

Prior predictive checks are required. Alternative plausible priors are planned
sensitivity analyses.

One reference system effect in each component is fixed to zero for
identification. Changing the computational reference must not change any
pairwise posterior contrast.

## Posterior computation

The default sampler runs four chains with at least 1,000 warmup and 1,000 kept
draws per chain. A method configuration can request more draws but cannot lower
the convergence gates.

A fit passes numerical diagnostics only when:

- split `R-hat` is at most `1.01` for every published parameter;
- bulk and tail effective sample sizes are at least `400`;
- there are no divergent transitions;
- there are no unresolved maximum tree-depth warnings;
- posterior values are finite and respect declared bounds.

A failed fit is retained in the run manifest but cannot produce a public score.

## Pairwise posterior estimates

For systems A and B and posterior draw `q`:

```text
Delta_ab[q] = d[a,q] - d[b,q]
```

Effects are oriented so positive values favor A. For practical threshold
`delta_m`:

```text
probability_a_better = mean(Delta_ab[q] > delta_m)
probability_equivalent = mean(abs(Delta_ab[q]) <= delta_m)
probability_b_better = mean(Delta_ab[q] < -delta_m)
```

The output also reports posterior mean, median, standard deviation, and the
2.5 and 97.5 percent credible quantiles. Pairwise results are emitted only for
systems in the same connected component.

## Anchor-relative preference scores

An anchor profile selects one anchor for each task family and analysis metric.
For system `i` and anchor `a`:

```text
PreferenceScore(i, a) =
    100 * (P(Delta_ia > delta_m)
           + 0.5 * P(abs(Delta_ia) <= delta_m))
```

The anchor score is `50`. The score is tied to the selected threshold, analysis
profile, anchor profile, method version, and dataset version.

If the selected anchor is absent from a component, the component uses its
declared local reference and receives `reference_status = component_local`.
Local-component scores are not used in global decision or Pareto views.

## Decision profiles

A decision profile declares its required task families, coverage rules, and
exactly two typed axes: quality and resource. Each axis contains its metric
cells, value functions, cell weights, and practical dominance threshold. Cell
weights within each axis and task family sum to `1`.

Every required task family has raw weight `1`. For the set `F` of required task
families:

```text
family_weight[f] = 1 / size(F)
```

Study count, task count, and run count do not affect `family_weight[f]`.
Additional evidence changes the posterior uncertainty for that family, not its
share of the global score.

Every metric-specific `analysis_system_id` maps through a reviewed
`decision_system_id`. All required cells for a decision system must resolve to
that same decision identity. Ambiguous or missing mappings produce
`insufficient_coverage`.

For system `i`, family `f`, cell `k`, and posterior draw `q`:

```text
family_quality_utility[i,f,q] =
    sum_k quality_cell_weight[f,k]
        * quality_value_function[f,k](effect[i,f,k,q])

family_resource_utility[i,f,q] =
    sum_k resource_cell_weight[f,k]
        * resource_value_function[f,k](effect[i,f,k,q])

family_utility[i,f,q] =
    quality_decision_weight * family_quality_utility[i,f,q]
    + resource_decision_weight * family_resource_utility[i,f,q]

global_quality_utility[i,q] =
    sum_f family_weight[f] * family_quality_utility[i,f,q]

global_resource_utility[i,q] =
    sum_f family_weight[f] * family_resource_utility[i,f,q]

global_utility[i,q] =
    quality_decision_weight * global_quality_utility[i,q]
    + resource_decision_weight * global_resource_utility[i,q]
```

The two decision weights sum to `1` when the profile emits total utility. A
Pareto-only profile can omit them and emit the two axis utilities without a
total utility.

Within a task family, posterior draws across cells must come from one
multivariate fit and preserve modeled correlations. A versioned
`cross_family_draw_policy_id` defines how the decision run combines draws from
separate family models. The policy records any independence or correlation
assumption. Without that policy, the pipeline does not emit a global posterior
score or a global probabilistic Pareto result.

Marginal fits can supply separate evidence charts but cannot supply a combined
decision score.

The output reports utility mean, median, credible interval, pairwise utility
probabilities, rank probabilities, and expected regret:

```text
expected_regret[i] = mean_q(max_j utility[j,q] - utility[i,q])
```

The candidate set is stored with the decision run. A missing required family or
cell sets `coverage_status = insufficient_coverage`. The calculation does not
renormalize family or cell weights.

## Resource ratios

For a log-resource effect relative to anchor:

```text
resource_ratio[i,q] = exp(-Delta_i_anchor[q])
```

Because positive `Delta` favors lower use, a ratio below `1` means the system is
estimated to use less resource than the anchor. Global resource ratios use the
decision profile's value function or an explicitly declared weighted geometric
mean. They never average incompatible resource definitions.

Pareto calculations do not use the display ratio directly. They use the
higher-is-better coordinate:

```text
resource_efficiency[i,q] = 1 / resource_ratio[i,q]
                         = exp(Delta_i_anchor[q])
```

The decision profile stores this transformation. The interface may label the
axis as resource use and reverse its visual direction, but the dominance
calculation always receives `resource_efficiency`.

## Probabilistic Pareto views

A Pareto analysis uses the quality and resource axes from its decision profile.
Both are oriented so higher is better. Each coordinate is a draw-level effect,
resource ratio, or declared value-function output. The anchor-relative
`PreferenceScore` is a posterior summary and cannot be used as a coordinate.
For draw `q`, system X practically dominates Y when:

```text
quality_x[q] >= quality_y[q] - threshold_quality
resource_x[q] >= resource_y[q] - threshold_resource
```

and at least one axis exceeds the other by more than its threshold.

This is the registered `practical_epsilon_frontier`, not the classical Pareto
partial order. With nonzero tolerances the pairwise relation need not be
transitive. The output and interface use that name and show both thresholds.

The posterior central estimates set `is_point_pareto`. Across usable draws:

```text
probability_non_dominated =
    non_dominated_draw_count / usable_draw_count
```

Pairwise dominance probabilities use the same denominator. A draw is usable for
one Pareto analysis only when every included system has both required axes and
both axes come from the same joint draw.

Systems enter one view only when they share the analysis profile, decision
profile, anchor profile, covered family set, and correlation policy.
The run stores the complete candidate universe, including excluded systems and
their reasons. If joint draws are unavailable, the method may publish point
coordinates and marginal intervals but does not calculate posterior dominance
or non-domination probabilities.

## Model checks

Each primary fit runs these checks:

- local-estimator calibration and network contrast-scale prior and posterior
  predictive checks;
- residual fit by study and system;
- heterogeneity assessment;
- direct versus indirect comparison where available;
- loop inconsistency where a cycle exists;
- effect-modifier balance across comparisons;
- leave-one-study-out influence;
- leave-one-independence-cluster-out influence;
- holdout prediction for eligible studies;
- every planned sensitivity profile.

The method configuration names the inconsistency estimator, its minimum data
requirements, and the effect and probability thresholds that make disagreement
material. The implementation cannot assign `supported` from visual inspection.

An acyclic connected network receives `consistency_status = not_testable`.
Failure of a check does not delete the result. It changes the relevant status
and keeps the diagnostic available for review.

## Evidence grades

An evidence assessment records `pass`, `concern`, or `fail` for:

- `provenance`;
- `configuration_completeness`;
- `task_evaluator_comparability`;
- `sample_replication`;
- `metric_validity`;
- `independence`.

The grade follows this precedence:

1. `unusable` if provenance or metric validity fails.
2. `low` if another domain fails.
3. `moderate` if no domain fails and at least one has a concern.
4. `high` if every domain passes.

Grades control profile eligibility. They do not alter likelihood weights.

## Result statuses

Each result records separate status dimensions.

`estimation_status`:

- `estimated` passed numerical diagnostics.
- `not_estimable` has no valid fit or connected contrast.

`evidence_status`:

- `supported` has at least the configured number of independent clusters that
  contribute to the requested target, no failed primary evidence domain, and
  remains estimable after removing any single contributing cluster.
- `provisional` is estimable but does not meet every supported condition.
- `insufficient_evidence` lacks eligible evidence for the requested result.

`consistency_status`:

- `supported` has no material direct-indirect or loop disagreement.
- `inconsistent` has a material disagreement under the configured threshold.
- `not_testable` lacks the network structure required for the check.

`stability_status`:

- `stable` preserves the declared decision conclusion in every required
  sensitivity analysis.
- `configuration_sensitive` changes under a required configuration analysis.
- `assumption_sensitive` changes under another required prior, likelihood,
  threshold, family, or correlation analysis.
- `unstable_network` loses the required connection or reverses under an
  influential study or cluster removal.

Status assignment follows a fixed order. The pipeline first assigns estimation
and reference status, then coverage and correlation status, then evidence and
consistency status, and finally stability from the registered sensitivity
results. Within stability, `unstable_network` takes precedence over
`configuration_sensitive`, which takes precedence over `assumption_sensitive`,
which takes precedence over `stable`. A missing required check prevents
`stable`.

`reference_status` is `anchored` or `component_local`.

`coverage_status` is `complete`, `matched_subset`, or
`insufficient_coverage`.

`correlation_status` is `estimated`, `prior_dominated`, `assumed`,
or `unavailable`.

A result enters the default public decision or Pareto view only when it is
`estimated`, `anchored`, and `complete`. Provisional, not-testable, and
assumption-sensitive results can appear with their labels. Inconsistent or
unstable results remain in the evidence view and are excluded from default
recommendations.

The publication policy lists the allowed status combinations explicitly. A
failed required fit or sensitivity needs a stored publication-impact decision;
no free-text override changes a status.

## Material conclusion changes

A sensitivity analysis changes a pairwise conclusion when the category with
the greatest practical-preference probability changes or when no category has
probability at least `0.5` after one did in the primary analysis.

It changes a Pareto conclusion when a system crosses the configured publication
threshold for `probability_non_dominated`. It changes a decision conclusion
when the preferred system changes or pairwise utility preference crosses the
profile's decision threshold.

Every decision and dominance threshold is stored in the immutable decision
profile. Metric-level practical-equivalence thresholds remain in the analysis
metric definition.

## Method configuration

`method_config.json` records:

- schema, dataset, method, policy, and software versions;
- task-family taxonomy and assignment reviews;
- metric definitions and mapping rules;
- local-estimator, effect-scale, and network-likelihood specifications;
- configuration policies and resolved analysis-system nodes;
- independence and covariance groups;
- analysis, anchor, and decision profiles;
- practical and decision thresholds;
- priors and sampler settings;
- correlation identification and joint-model policies;
- evidence assessments;
- sensitivity plans;
- required sensitivity registry and status precedence;
- decision-system mappings and Pareto candidate policies;
- random seed and deterministic preprocessing settings.

Pinned source snapshots, the configuration, and the model code revision must
reproduce the published summaries within the numerical tolerances in
[`VALIDATION.md`](VALIDATION.md).
