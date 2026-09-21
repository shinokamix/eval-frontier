# Research methodology

Eval Frontier combines public coding-agent studies into connected evidence
networks. It estimates relative system effects while preserving differences in
benchmark difficulty, run configuration, measurement, and uncertainty.

Use the [`documentation index`](README.md) to find the calculation, data
contract, validation rules, and current implementation.

## Research question

For a selected task family, metric, and analysis profile, Eval Frontier asks:

> What is the probability that system A produces a practically preferable
> result to system B after combining all eligible public studies and accounting
> for study variation and measurement uncertainty?

The method does not estimate one universally best system. Every estimate is
conditional on a task family, metric definition, compatibility policy, and
decision profile.

## Systems and configurations

A system lineage has three fields:

```text
model x harness x effort
```

An exact `configuration_id` also records the model and harness versions,
prompt, tools, retry policy, timeout, environment, and evaluation date. The
lineage connects studies. The configuration policy decides whether two exact
configurations can be pooled, adjusted through model covariates, split into
separate nodes, or excluded.

The policy uses four actions:

- `pool` treats the difference as immaterial for the selected analysis.
- `adjust` includes a declared configuration covariate in the model.
- `split_node` keeps both results but assigns separate analysis-system IDs.
- `exclude` removes the result from that analysis.

Every action has a reason, reviewer, policy version, and review timestamp.
An adjusted analysis also has to pass registered design-rank and overlap tests.
If study comparisons cannot identify a configuration coefficient, the policy
must split the node or exclude the configuration.

## Studies remain separate experiments

Two studies can use the same benchmark name under different task snapshots,
prompts, evaluators, timeouts, hardware, and accounting rules. Eval Frontier
does not pool their raw values.

Each study receives its own baseline parameter. Systems are compared within a
study, and repeated systems connect relative effects across studies. A score of
`0.6` on a hard benchmark is not treated as worse than `0.9` on an easy
benchmark merely because the raw value is lower.

Multi-system studies enter the model jointly. Pairwise contrasts from one study
are not treated as independent observations.

## Estimands and analysis metrics

Every analysis declares the quantity it estimates before fitting a model. An
analysis metric specifies:

- the outcome and direction;
- the source metric definitions it accepts;
- the local estimator, effect scale, and network likelihood;
- the population and denominator;
- the resource accounting basis;
- the practical-equivalence threshold;
- the target task family;
- the configuration policy;
- the prior specification.

Source metrics remain unchanged. A versioned compatibility rule can map a
source metric definition to an `analysis_metric_id`. The rule cannot silently
convert a mean into a median, cost per attempt into cost per success, or total
tokens into fresh tokens.

## Data eligibility

The primary model needs task-level observations, reported uncertainty, or
sufficient counts to derive uncertainty. Point estimates and ordinal results
remain visible, but they do not affect model estimates, decision scores, or
Pareto views.

[`SCORING.md`](SCORING.md#analysis-profiles) defines the eligibility rules.
[`DATASETS.md`](DATASETS.md#study-result-table) defines the availability values.

## Task families and transitivity

Task families define which studies can support indirect comparisons. The
initial families are software engineering, terminal and shell, and general
coding.

Connectivity alone is not enough. Indirect comparison requires plausible
transitivity. The review checks effect modifiers such as task composition,
evaluator, benchmark version, timeout, tool access, retry policy, environment,
and resource accounting across every part of the network.

The data contract stores these modifiers as normalized values. Each task family
registers required modifiers, missing-value rules, and balance thresholds. A
free-text transitivity note cannot make an indirect comparison eligible.

A family assignment is `primary`, `ambiguous`, or `excluded`. The primary
analysis uses primary assignments. Planned sensitivity analyses move or remove
ambiguous assignments.

## Bayesian evidence networks

The primary method is Bayesian hierarchical random-effects network
meta-analysis. A separate evidence network is fitted for each task family,
analysis metric, and analysis profile.

The method has two statistical stages. The local stage estimates marginal
within-study contrasts over the declared task population. It keeps repeated
trials and all arms for one task together and emits the full sampling
covariance matrix. The network stage combines those contrasts with a
multivariate normal random-effects model.

This separation gives task-level and aggregate sources one common estimand.
For example, binary quality uses a marginal log odds ratio. It does not mix a
conditional task coefficient with an aggregate odds ratio. Resource metrics
use ratios of arithmetic expected resource per attempt. They do not substitute
geometric means.

Task-level sources use a paired task-cluster estimator. Aggregate sources must
report enough information to reconstruct the same contrast and its sampling
variance. Multi-system and multi-outcome studies supply covariance, not a set
of independent pairwise rows. The network model separates sampling covariance
from between-study heterogeneity.

Count and unbounded continuous outcomes are outside method version `2.0`.
Published point estimates without reconstructable uncertainty remain visible
but do not enter the primary model.

## Heterogeneity

Relative system performance can change across benchmarks. A random-effects
model estimates that variation instead of assuming one fixed effect.

Heterogeneity is an output, not a nuisance hidden inside an interval. Published
results report its posterior estimate and identify systems whose results vary
substantially among studies.

A fixed-effect fit is a sensitivity analysis. It is not the primary result.

## Related studies and reused data

An `independence_cluster_id` groups publications that reuse tasks, runs,
infrastructure, or derived results.

The pipeline handles related evidence in this order:

1. Remove exact duplicate runs from quantitative synthesis.
2. Merge complementary reports of the same evaluation campaign.
3. Record known covariance for shared tasks, arms, or runs.
4. Fit multi-system studies and correlated outcomes jointly.
5. Select the most complete report for the primary analysis when covariance
   cannot be reconstructed.
6. Include alternate reports in planned sensitivity analyses.

The method does not give each cluster an arbitrary equal weight. Sample size,
measurement uncertainty, and dependence enter through the likelihood and
covariance structure. Leave-one-cluster-out analysis still measures influence.

## Practical preference

The model fits effect magnitudes before it classifies a comparison. A versioned
threshold divides posterior draws into A better, practically equivalent, and B
better. Published precision and exact equality do not define equivalence.

[`SCORING.md`](SCORING.md#pairwise-posterior-estimates) defines the calculation.

## Pairwise and anchor-relative results

The primary output is the posterior comparison for every pair in one connected
component. It includes the effect estimate, credible interval, practical
preference probabilities, direct evidence count, indirect paths, heterogeneity,
and diagnostics.

An anchor profile selects one stable analysis-system node for each task family
and analysis metric. The resulting preference score summarizes the posterior
comparison with that anchor. It is not an absolute measure of quality.

If a connected component does not contain the anchor, results use a declared
local reference and receive `reference_status = component_local`. Scores from
separate local components do not share a scale.

[`SCORING.md`](SCORING.md#anchor-relative-preference-scores) defines the score.

## Multiple outcomes

Quality, cost, time, and tokens remain separate estimands. When the same runs
report several outcomes, the local estimator creates one stacked contrast
vector and estimates covariance across arms and outcomes.

If the data cannot identify a correlation, the analysis records whether the
correlation is prior-dominated, assumed, or unavailable. Marginal estimates can
still be published. A probabilistic Pareto result requires a fitted joint model
or a registered correlation sensitivity set. If correlation is unavailable,
the product can show central coordinates and marginal intervals but cannot
publish a probability of non-domination.

## Decision profiles

Evidence synthesis and decision analysis are separate steps. The evidence
model produces posterior effects within each task family. A versioned decision
profile maps those effects to utility for one declared use case.

No decision profile is a universal ranking.

Method version `2.0` can combine several task families in one global decision
profile. Each required task family has raw weight `1`. For `F` required
families, each normalized family weight is `1 / F`. The number of studies,
tasks, or runs in a family does not change its weight. More evidence reduces
uncertainty within that family.

A global decision profile requires the same task families for every candidate.
A missing required family or metric produces `insufficient_coverage`. The
calculation never replaces a missing value with zero or renormalizes the
remaining weights.

Each family model must supply joint draws for the quality and resource metrics
that the profile uses. A registered cross-family draw policy combines draws
from the separate family models. The global score remains conditional on the
selected decision profile, required families, value functions, and anchors.

Analysis-system nodes can differ by metric because one policy may pool a
configuration while another splits it. A reviewed mapping therefore connects
each metric-specific node to a stable `decision_system_id`. Ambiguous mappings
are excluded rather than joined by display name.

[`SCORING.md`](SCORING.md#decision-profiles) defines decision profiles and their
outputs.

## Quality and resource views

The main decision views compare quality with:

- cost per attempt;
- time per attempt;
- fresh tokens;
- total tokens.

These definitions produce separate views. Cost, time, or tokens per success are
outside method version `2.0`. Relative evidence networks do not identify the
absolute baselines needed for those values, and finite or adaptive retry
policies need separate estimands. The interface states the per-attempt
denominator and retry accounting policy.

Resource axes report an anchor-relative ratio when possible. For example, a
cost ratio of `0.8` means that the system uses an estimated 80 percent of the
anchor's cost under the selected profile. Absolute currency claims require a
shared price snapshot and accounting basis.

## Probabilistic Pareto views

Every joint posterior draw produces one quality and resource coordinate for
each eligible decision system. A coordinate is a draw-level effect, ratio, or
declared value-function result. `PreferenceScore` is a posterior summary and
cannot be used as a draw-level coordinate. Practical dominance uses the
configured thresholds. A
system dominates another when it is no worse than the threshold on both axes
and better than the threshold on at least one axis.

The method calls this a practical epsilon-frontier. It is a decision rule, not
the classical Pareto partial order, and nonzero thresholds can make pairwise
dominance non-transitive.

The output reports:

- whether the posterior central estimate is on the practical frontier;
- the probability of being non-dominated;
- pairwise dominance probabilities;
- marginal intervals and a joint credible region when identified;
- the number of usable posterior draws;
- evidence, consistency, stability, reference, coverage, and correlation
  statuses.

Systems enter one Pareto view only when they use the same analysis, anchor, and
decision profiles and meet the same family coverage rule. The analysis stores
the full included and excluded candidate set because non-domination probability
depends on which systems compete in the view.

## Evidence assessment

Editorial evidence assessment and statistical uncertainty remain separate. An
assessment reviews provenance, configuration completeness, task and evaluator
comparability, sample and replication quality, metric completeness, and
independence.

Grades do not become numerical model weights.

[`SCORING.md`](SCORING.md#evidence-grades) defines the grading rules.

## Primary and sensitivity analyses

The primary analysis uses the declared evidence, family, metric, and
configuration policies. Planned sensitivity analyses vary assumptions that can
change a conclusion. The publication records every required analysis,
including failed fits and missing outputs.

[`SCORING.md`](SCORING.md#model-checks) lists the required analyses.

## Diagnostics and result status

A connected acyclic network can produce estimates but cannot test consistency.
It receives `consistency_status = not_testable`. Disconnected components remain
separate. The method never infers an order between them.

Result statuses describe separate limits. They are not compressed into one
grade. [`SCORING.md`](SCORING.md#result-statuses) defines their exact values and
publication rules. [`VALIDATION.md`](VALIDATION.md) defines the checks and
publication gates.

## Interpretation limits

The method combines observational evidence from benchmark studies. It cannot
remove every difference in prompts, infrastructure, task selection, prices, or
reporting. More studies improve precision only when the evidence network is
connected and its transitivity assumptions remain plausible.

Use results to select systems for further testing. Before deployment, evaluate
the candidates on the repositories, tasks, and constraints that matter to the
decision.
