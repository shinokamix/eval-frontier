# Validation and publication gates

This file defines the validation required for Eval Frontier method version
`2.0`. A build can complete for research use without passing every publication
gate. It cannot enter the default public decision or Pareto views until all
required gates pass.

## Validation layers

Validation has five layers:

1. Source and schema validation.
2. Deterministic transformation tests.
3. Statistical implementation tests.
4. Evidence-network and model checks.
5. Release and consumer-contract checks.

Each check writes a machine-readable result with `pass`, `concern`, `fail`, or
`not_testable` status. A release manifest includes all failures and concerns.

## Source and schema validation

The pipeline must reject a quantitative input when:

- its source snapshot or checksum is missing;
- its source locator does not resolve;
- a required foreign key is absent;
- an enum contains an unknown value;
- an event count is negative or greater than its denominator;
- a standard error or scale width is non-positive;
- an interval has reversed bounds;
- a positive resource value is zero or negative without a censoring rule;
- a bounded score falls outside its declared scale;
- a task-level row lacks a task ID;
- a supposedly exact duplicate has conflicting values;
- a metric mapping omits its policy version or reviewer;
- a published contrast does not identify both configurations;
- an interval used for uncertainty omits its confidence level, interval type,
  or transformation;
- a covariance matrix is asymmetric, has a non-positive diagonal, or is not
  positive semidefinite within tolerance;
- a decision-system mapping is missing or ambiguous for a required cell;
- a required effect modifier is absent without a registered missing-value rule.

Missing optional values remain null. Schema coercion cannot turn malformed
input into an eligible result.

## Data-availability tests

Each study result must satisfy its availability contract:

- `task_level` resolves to eligible task or trial observations.
- `aggregate_with_uncertainty` supplies a standard error, variance, interval,
  or a registered equivalent.
- `aggregate_with_denominator` supplies the sufficient counts required by its
  likelihood.
- `point_estimate_only` cannot enter a primary fit.
- `ordinal_only` cannot enter any quantitative fit.

When published rounding is reversed to recover counts, the pipeline enumerates
every count consistent with the reported precision. The result is eligible only
when every consistent count produces the same configured inclusion decision.
The sensitivity range retains all consistent counts.

## Deterministic transformation tests

Every mapping and derived field has a golden test. Required invariants include:

- stable IDs under input row reordering;
- identical normalized tables from identical source snapshots;
- lexical orientation of study contrasts;
- sign reversal when contrast systems are swapped;
- exact unit conversions within declared tolerance;
- no conversion between incompatible statistics or denominators;
- correct direction normalization so positive effects always favor system A;
- unchanged results when an exact duplicate source row is removed;
- unchanged primary inputs when an alternate report in the same independence
  cluster is added;
- stable artifact ordering and checksums outside declared build metadata.

## Golden fixtures

The repository must contain small reviewed fixtures with expected normalized
tables and model summaries.

### Binary connected network

Three studies connect systems A, B, and C. Expected outputs cover binomial
count summaries converted into local marginal log-odds contrasts, indirect A
versus C estimates, anchor scores, and one network cycle.

### Multi-system study

One three-arm study verifies the full local sampling covariance matrix and its
separation from the heterogeneity matrix. Reordering the arms must not change
any posterior contrast beyond Monte Carlo tolerance.

A second fixture has fewer task clusters than contrast dimensions. Its sampling
matrix is positive semidefinite and rank deficient. The primary and fixed-effect
profiles must reject it without diagonalizing `S` or substituting
between-study heterogeneity for missing sampling uncertainty.

### Disconnected network

Two components verify that no cross-component estimate, global score, or Pareto
comparison is emitted.

### Reused campaign

Two reports of the same runs verify deduplication, merge precedence, alternate
report sensitivity, and covariance metadata.

### Mixed evidence granularity

Task-level data and aggregate counts for one estimand verify that both
local-estimator paths recover compatible marginal effects without inventing
task rows or treating repeated trials as independent tasks.

### Multiple outcomes

Paired quality and cost observations verify outcome covariance, marginal
fallbacks, the joint-draw requirement, and Pareto probabilities. A build using
separate marginal fits must omit all joint probabilities.

### Configuration adjustment

One fixture has an identifiable configuration effect with adequate comparison
overlap. A second fixture perfectly confounds configuration with system. The
first must pass design checks; the second must split or exclude its node.

### Effect modifiers

One network has balanced normalized modifiers. Another has a required modifier
missing on an indirect path. The second network cannot use that path in the
primary profile.

### Missing and poor evidence

Point-only and ordinal results verify that the evidence view retains them while
all quantitative output excludes them.

## Simulation-based calibration

Simulation tests generate data from known parameters over a range of network
shapes, sample sizes, heterogeneity, task difficulty, outcome correlations, and
missingness patterns.

The test suite checks:

- recovery of pairwise effects without material bias;
- nominal coverage of credible intervals;
- calibrated practical-preference probabilities;
- recovery of heterogeneity when the network contains enough information;
- correct uncertainty expansion in sparse networks;
- correct multi-system covariance;
- correct outcome correlation when paired data is informative;
- no false precision when correlation is prior-dominated;
- correct behavior under complete separation and saturated benchmarks;
- stable inference under a changed computational reference arm.

Coverage targets and Monte Carlo tolerances live in versioned validation
configuration. A method release records the simulation seed, scenario grid,
software versions, and complete result table.

## Reference invariance

For every fixture and sampled production audit, refit the model under at least
two computational reference systems. Pairwise posterior means, intervals, and
preference probabilities must agree within the configured Monte Carlo
tolerance.

Presentation anchors can change anchor-relative scores but cannot change raw
pairwise posterior contrasts or model fit.

## Prior validation

Every analysis metric requires a prior predictive check on its declared
contrast scale. The check also applies simulated contrasts to a registered grid
of plausible arm baselines and rejects priors that concentrate on impossible or
operationally meaningless implied arm values. It does not claim to simulate an
absolute baseline that the contrast model does not contain.

The required prior sensitivity set includes:

- wider and narrower system-effect priors;
- wider and narrower heterogeneity priors;
- alternate valid correlation priors for multivariate fits.

A result is `assumption_sensitive` when a required prior changes the declared
decision conclusion under [`SCORING.md`](SCORING.md#material-conclusion-changes).

## Sampler diagnostics

Every public model run must meet all numerical gates in
[`SCORING.md`](SCORING.md#posterior-computation). The validation report also
includes energy diagnostics, trace summaries, posterior autocorrelation, and
parameter-specific effective sample sizes.

Increasing sampler iterations is allowed. Relaxing a diagnostic threshold
requires a new method version and a documented validation review.

## Local-estimator and posterior predictive checks

Local-estimator validation operates on the original observation scale before
network fitting. Simulation and task-cluster resampling check recovery and
interval coverage for event rates, bounded task summaries, failure and timeout
handling, and arithmetic resource means. These are estimator checks, not draws
from an arm-level posterior model.

Network posterior predictive checks operate on the modeled contrast scale.
They compare observed and replicated study contrasts, standardized residuals,
between-study dispersion, and cross-outcome contrast correlation. Diagnostics
are grouped by study, system pair, benchmark, configuration class, and evidence
grade. A global check cannot hide a severe study-specific mismatch.

## Network validity checks

Every fitted component records:

- nodes, edges, cycles, bridges, and articulation nodes;
- direct evidence by pair;
- independence clusters by edge;
- effect-modifier distributions by comparison;
- direct versus indirect checks where estimable;
- loop inconsistency where a cycle exists;
- influence of every study and independence cluster.

An acyclic component reports consistency as `not_testable`, not `supported`.
A component that depends on one bridge reports the affected comparisons and
tests bridge removal.

## Holdout prediction

For every study that can be removed without making its systems entirely
unseen, fit the model without that study and predict its within-study contrasts.

The report includes:

- predictive interval coverage;
- log predictive density or another declared proper score;
- direction and practical-category accuracy;
- errors by benchmark and configuration class.

Holdout prediction measures whether the evidence network generalizes to a new
study. It is not replaced by in-sample fit.

## Sensitivity completion

Before publication, every sensitivity analysis registered in
`method_config.json` must have one of these outcomes:

- completed with results;
- not applicable with a machine-readable reason;
- failed with diagnostics and a publication impact decision.

The pipeline cannot silently omit a failed or expensive sensitivity fit.

## Decision and Pareto invariants

Decision-layer tests verify:

- every decision profile contains exactly one quality axis and one resource
  axis;
- profile weights sum to `1` at each aggregation step;
- cell weights sum to `1` within each axis and task family;
- the two decision weights sum to `1` when total utility is emitted;
- a Pareto-only profile can omit decision weights but cannot emit total utility;
- every required task family has raw weight `1` and normalized weight `1 / F`;
- study, task, and run counts do not change task-family weights;
- required missing cells produce `insufficient_coverage`;
- a missing required task family produces `insufficient_coverage`;
- weights are not silently renormalized;
- each global draw equals the weighted sum of its stored family contributions;
- every stored axis utility equals the weighted sum of the profile cells for
  that axis;
- every global posterior run records its cross-family draw policy;
- value functions are monotone in the declared direction;
- anchor systems have preference score `50` within tolerance;
- pairwise practical-preference probabilities sum to `1`;
- pairwise Pareto dominance probabilities sum to `1`;
- a strictly improved system cannot receive lower utility under a monotone
  value function;
- dominated systems are absent from the point frontier;
- every resource Pareto coordinate equals `1 / resource_ratio` within
  tolerance, so a larger coordinate always means lower resource use;
- a Pareto analysis resolves both axis definitions and thresholds from its
  immutable decision profile and does not carry a second copy;
- posterior non-domination probabilities use only draws with complete axes;
- all systems in one Pareto view share the declared coverage and correlation
  policy;
- the Pareto candidate artifact includes every considered system and a reason
  for each exclusion;
- `PreferenceScore` never appears as a posterior-draw coordinate;
- posterior non-domination probability is absent when correlation status is
  `unavailable`;
- expected regret equals the draw-wise loss against the best candidate;
- metric-specific nodes map to one reviewed decision-system identity.

## Reproducibility

A published release pins:

- every source snapshot and checksum;
- schema, dataset, method, and policy versions;
- normalized configuration and its checksum;
- code revision;
- sampler and preprocessing seeds;
- Python and statistical-library versions;
- platform details that affect numerical results.

Deterministic preprocessing must reproduce byte-identical tables. Posterior
summaries must reproduce within declared Monte Carlo tolerance. Exact posterior
draw order is not a publication requirement.

## Consumer-contract validation

Before publication:

- JSON Schema, Arrow schema metadata, TypeScript types, and the web validator
  are generated from the pinned Pydantic schema version;
- every Parquet file validates against its Arrow schema;
- `method_config.json` validates against its JSON Schema;
- `research.json` validates against its JSON Schema and the web Zod schema;
- all file references in the manifest resolve;
- all artifact checksums match;
- the web application loads the new read model without fallback coercion;
- a previous supported schema version remains readable or has a documented
  migration and deprecation entry.

## Publication gates

### Public evidence

A pairwise estimate can enter the public evidence view only when it meets all
of these conditions:

- source and schema validation pass;
- the sampling covariance is identified;
- the model fit passes sampler diagnostics;
- required contrast-scale predictive checks do not fail;
- every required sensitivity has a recorded outcome.

The estimate keeps provisional, inconsistent, not-testable, or sensitive
labels.

An anchor-relative preference score has the same requirements. It also requires
`reference_status = anchored`. A component-local score remains in downloadable
model artifacts and does not appear as a comparable public score.

### Default recommendations

A pairwise result can enter a default recommendation only when it is
`estimated`, `supported`, and `stable`. Its consistency status must be
`supported` or explicitly `not_testable` under the publication policy. An
anchor-relative result also requires `reference_status = anchored`.
Inconsistent results cannot enter a default recommendation.

### Decision and Pareto views

A model result can enter the default public decision or Pareto view only when:

- source and schema validation pass;
- the model fit passes sampler diagnostics;
- required posterior predictive checks do not fail;
- the result is anchored and has complete profile coverage;
- a joint-output view has `correlation_status` equal to `estimated`,
  `prior_dominated`, or `assumed` and comes from one multivariate fit;
- all required sensitivity analyses are complete or have an approved
  publication impact decision;
- no unresolved provenance or metric-validity failure applies;
- consumer-contract validation passes.

Inconsistent, unstable, component-local, and insufficient-coverage results
remain downloadable in the evidence artifacts but do not enter default
recommendations.

## Independent method review

Before method version `2.0` is declared stable, an independent reviewer should
attempt to falsify the specification. The review must cover:

- whether each estimand is identifiable from the allowed data;
- whether task-level and aggregate likelihoods can be combined as specified;
- whether multi-system and multi-outcome dependence is handled correctly;
- whether transitivity and configuration assumptions are operational;
- whether status transitions and publication gates are deterministic;
- whether the data contract contains every required model input and output;
- whether the current source archive can exercise each implemented likelihood;
- whether any published chart could imply more than the model estimates.

Review findings are resolved in documentation or recorded as explicit limits
before implementation begins.
