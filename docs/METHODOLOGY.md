# Research methodology

This document specifies the planned analysis. The current implementation builds
the evidence table and audits its sources; it does not yet estimate the model
or produce the graph. The
[source audit](../research/analysis/notebooks/source_audit.py) reports current
data coverage and source-specific limitations.

## Research question

We compare coding-agent systems to identify useful trade-offs between task
success and reported USD cost when choosing tools for development. A system is
a model, harness, and effort setting. We evaluate each combination as a whole;
the analysis does not isolate the causal contribution of its components.

The result is a graph of relative quality and cost across public benchmarks,
with uncertainty intervals and a Pareto frontier. The frontier identifies
systems worth investigating on a developer's own tasks. It describes the
included systems and benchmark population, rather than a universal ranking.

## Data and comparability

The analysis uses immutable snapshots of public results. Each measurement
retains its source artifact and location in the
[canonical evidence table](DATASETS.md). Source reviews document the outcome
definitions, scoring rules, cost coverage, execution settings, and reasons for
omitting data from either outcome. A source may inform quality, cost, or both.

An evaluation campaign groups runs on a defined task set under a common scoring
and execution protocol. A publication or leaderboard row does not by itself
define an independent campaign. Reports of the same runs contribute once, and
shared tasks retain their dependence. When both aggregates and detailed results
describe the same outcome, we use one representation in the model.

Shared systems connect comparisons across campaigns. Before accepting a link,
we review model and harness versions, effort, task families, run limits, and
cost accounting. Unknown effort does not establish a shared system. Indirect
comparisons assume that differences between campaigns do not systematically
favor particular systems after accounting for the modeled variation. Matching
names alone cannot establish this assumption, as in
[network meta-analysis](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-11).

## Outcomes

Quality is the probability that an attempted task is solved. Failures and
timeouts count in the denominator. A publisher's exclusion of attempts from
scoring requires a supported reconciliation before its score can represent
this outcome. Partial credit and pass@k remain separate outcomes.

Cost is the arithmetic mean reported USD expenditure for an attempt on a
uniformly selected target task, including unsuccessful attempts. Quality and
cost refer to the same kinds of attempts. Retry records must establish which
attempts enter the score and which costs the total includes. Unresolved retries
keep the affected outcome out of the primary analysis. Published totals become
means only when their attempt counts and cost coverage are known. Tokens and
duration do not substitute for USD cost.

Within each campaign, systems are evaluated on a common target task set with
equal task weights. Repeated attempts estimate each task's outcomes without
giving that task extra weight. Missing task results are distinguished from
observed failures. Published aggregates must represent these task weights.
Dividing a total by its attempt count gives equal task weights only when each
task has the same number of attempts; unequal counts require task-level
reconciliation.

The primary cost analysis uses configurations with complete cost coverage and
a documented accounting basis that supports the comparison. Missing costs are
not treated as zero. We describe missingness by system, task, and outcome, and
keep analyses that assume values for missing costs separate. Published cost
means without a supported uncertainty estimate remain descriptive.

## Statistical analysis

We estimate quality and cost with separate hierarchical Bayesian models.
Campaign baselines account for differences in difficulty and cost, while
system effects may vary across campaigns. Task effects preserve the dependence
of repeated attempts and comparisons on shared tasks. Shared systems allow
estimation of comparisons that were not observed directly.

Trial success uses a Bernoulli likelihood with a logit link. Positive trial
costs use a lognormal likelihood, with a separate probability for reported zero
costs. Expected cost includes both zero and positive values and is an
arithmetic mean. Aggregate observations enter through likelihoods appropriate
to their reported counts or uncertainty; repeated trials are not assumed
independent merely because a publication supplies an aggregate count.

The analysis specification records the exact model equations, priors, and
aggregate likelihoods before fitting. We check prior predictions and use
simulated data to assess recovery of known effects and interval coverage.
Posterior predictive checks and convergence diagnostics assess the fitted
models. Cost checks compare observed and replicated arithmetic means for each
system within each campaign using the same task weights. They also compare how
much rare expensive attempts contribute to these means.
Where direct and indirect comparisons coexist, we check their
agreement. Failed checks limit the reported comparisons rather than justify
an unchecked pooled estimate.

## Common comparison scale

For each comparison group, we fix a target set of reviewed campaigns and one
reference system before fitting. Every plotted system must connect to that
reference through usable evidence for each outcome. Disconnected groups have
separate graphs. Sources that support only one outcome may inform its model,
but do not change the target campaigns of individual points.

Let `p_sj` be system `s`'s success probability and `c_sj` its expected cost in
campaign `j`, averaged over the common target tasks. With reference system `r`
and campaign weights `w_j` summing to one, the plotted quantities are:

```text
quality difference = 100 × sum_j w_j × (p_sj - p_rj)
log cost ratio     = sum_j w_j × (log c_sj - log c_rj)
relative cost      = exp(log cost ratio)
```

The primary summary gives equal weight to each distinct reviewed campaign.
Campaign boundaries are fixed before fitting, and the model accounts for
dependence from shared tasks. All systems use the same campaigns and weights
on both axes. Predictions for unobserved system-campaign combinations depend
on the shared-system links and are identified as indirect evidence. Cost ratios
require positive expected costs; an entirely zero-cost result remains outside
this relative summary.

The reference has relative cost 1 and quality difference 0. A cost ratio of
0.7 means a typical within-campaign cost 30% below the reference, and a quality
difference of +5 means five percentage points more tasks solved. Relative cost
is a geometric summary of ratios of arithmetic means, not a ratio of pooled
expenditure. Both coordinates describe the declared benchmark mix.

## Pareto frontier and uncertainty

Each point shows the posterior mean quality difference and the exponential of
the posterior mean log cost ratio, with 95% marginal credible intervals.
Re-expressing the same fitted model against another reference preserves the
ordering of these estimates. The graph labels the reference, campaign weights,
and cost basis. Each system also reports its supporting campaigns and dependence
on indirect comparisons. Systems without a supported estimate on both axes
remain in the evidence summary with the reason they cannot be plotted.

We construct the ordinary Pareto frontier from the point estimates. A system
dominates another if it costs no more and has no lower quality, with a strict
advantage on at least one axis. The frontier contains systems that no other
plotted system dominates within the same comparison group.

Frontier membership summarizes estimated trade-offs; it is not a probability
of superiority or an automatic recommendation. Systems outside the frontier
remain visible. Small estimated differences and uncertain comparisons require
inspection of the underlying evidence. Marginal intervals do not establish
joint dominance, so we do not infer dominance probabilities from them or use
them as admission thresholds.

## Sensitivity and reproducibility

We repeat the analysis with equal task-family weights, alternative plausible
priors, and reviewed alternatives for cost accounting and missingness. We also
remove each study in turn. Study-removal checks retain the target population
where estimation remains supported; changing the target benchmark mix is a
separate sensitivity analysis. We report changes in coordinates and the
frontier, distinguishing reversals from loss of evidence or network
connectivity. These checks do not assign a binary stability label.

The reported results include the snapshot identifiers, inclusion decisions,
campaign definitions, weights, model specification, diagnostics, and code
needed to reproduce the graph. Derived estimates remain separate from the
source measurements. Sparse coverage, uncertain accounting, and dependence on
individual studies limit how well the frontier can guide choices on new tasks.
