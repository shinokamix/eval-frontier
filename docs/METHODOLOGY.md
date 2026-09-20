# Research methodology

Eval Frontier compares coding-agent systems across public studies. It treats
each study as a separate experiment and combines only relative results from
compatible studies.

[`SCORING.md`](SCORING.md) defines the calculation. [`DATASETS.md`](DATASETS.md)
defines the data tables. [`research/README.md`](../research/README.md) describes
the current implementation.

## Research question

Eval Frontier asks which systems offer useful tradeoffs between quality and
resource use across coding tasks.

A system has three fields:

```text
model x harness x effort
```

Exact run settings remain attached to every result. These settings include the
model version, harness version, prompt, tools, retry policy, timeout,
environment, and evaluation date.

The broad system key connects studies that would otherwise form isolated
groups. Run settings do not split the key by default. Compatibility reviews and
sensitivity analyses show when those settings change a result.

## Studies remain separate

Two studies can use the same benchmark name under different conditions. Task
snapshots, prompts, evaluators, timeouts, hardware, and accounting rules can all
change the result.

Eval Frontier first compares systems inside each study. It does not combine raw
benchmark values from separate studies.

Each local comparison keeps two forms of evidence:

- An outcome records a win, tie, or loss.
- An effect size records the size of the difference when the source supports
  that calculation.

The MVP uses outcomes for its cross-study ranking. It publishes effect sizes
and their uncertainty for review and for later methods.

## Compatibility controls the evidence network

Each study receives a compatibility status for one task family and metric:

- `primary` includes the study in the primary analysis.
- `sensitivity_only` includes the study only in a sensitivity analysis.
- `incompatible` excludes the study from that analysis.
- `unknown` records that the available source does not support a decision.

A review considers the task set, evaluator, metric definition, system settings,
and resource accounting. Unknown settings can remain in the primary analysis
when every system in the study shared them. Unknown system-specific settings
normally move the study to a sensitivity analysis.

Configuration rules assign each difference one action. `record` keeps the
difference as metadata. `sensitivity` keeps the evidence in the primary fit and
tests its removal. `exclude` removes the evidence from the primary fit.

This policy preserves useful overlap without claiming that every run
configuration is identical.

## Task families limit indirect comparisons

The method groups benchmarks by the ability that they measure. The initial
families are software engineering, terminal and shell, and general coding.

A family determines which studies enter one comparison network. A benchmark
does not join a family only because its tasks contain code.

Each assignment has a review status and a reason. The primary analysis uses
primary assignments. Sensitivity analyses move or remove ambiguous
assignments.

## Overlap connects studies

Systems form the nodes of a comparison network. A study connects the systems
that it compares under shared conditions.

Weighted Bradley-Terry estimates relative performance when studies overlap
only in part. Every system does not need to appear in every study. A comparison
path must still connect two systems before the method can compare them.

Disconnected components remain separate. The method does not infer an order
between systems with no comparison path.

Bradley-Terry is the MVP ranking method, not the final evidence model. The data
contract also stores effect sizes, standard errors, and covariance groups. A
later method can use those fields for random-effects network meta-analysis.

## Related studies share one weight

Several publications can reuse one evaluation campaign. Counting each
publication as independent evidence would give the same runs extra influence.

The method assigns related studies to an independence cluster. Each cluster
receives the same total weight for one task family and metric. Studies,
comparison groups, and pairwise outcomes divide that weight.

Sample size does not change the outcome weight in the MVP. Sample size affects
uncertainty and evidence metadata. A later random-effects model can use the
sampling error directly.

Pairwise outcomes from one multi-system study remain dependent. The weight cap
and cluster bootstrap limit their influence, but they do not model that
dependence. The stored covariance groups support a later joint model.

## A fixed anchor gives scores a stable meaning

Each task family and metric defines a versioned anchor system. The anchor has
broad coverage and stable settings.

A family score reports the estimated chance that a system beats the anchor. A
score of `50` means equal estimated odds against the anchor. A score of `70`
means an estimated 70 percent chance of beating the anchor.

If a connected component does not contain the anchor, the method uses a local
reference and marks every score as `component_local`. Scores from separate
local components do not share a scale.

The primary output remains the matrix of pairwise probabilities. A family score
is a compact view of that matrix.

## Evidence grades control use, not weight

An evidence assessment applies to one study result and metric. It reviews six
domains:

- source provenance.
- configuration completeness.
- task and evaluator comparability.
- sample size and replication.
- metric completeness.
- independence from other evidence.

Each domain receives `pass`, `concern`, or `fail`, plus a reason. The domain
results produce one grade:

- `A` means that every domain passes.
- `B` means that no domain fails and at least one domain has a concern.
- `C` means that at least one failed domain limits the result to sensitivity
  analyses.
- `D` means that provenance or metric failures prevent a valid comparison.

The grade never becomes a numerical weight. Statistical weights and editorial
judgments remain separate.

## Primary and sensitivity analyses answer different questions

The primary analysis includes compatible evidence with grade `A` or `B`. It
uses primary task-family assignments and exact metric definitions.

Sensitivity analyses test the choices that can change the network. They can
include grade `C`, ambiguous family assignments, material configuration
differences, and alternative tie rules. They also remove each independence
cluster in turn.

A result is stable when these planned analyses preserve its main pairwise and
Pareto conclusions. The published output records disagreements instead of
hiding them behind one score.

## Resource metrics remain separate

Quality, cost, time, and tokens answer different questions. The method fits a
separate model for each metric.

Resource definitions also remain separate. For example, cost per attempt does
not equal cost per success. Mean time does not equal median time. Total tokens
do not equal fresh tokens.

The primary Pareto views compare quality with cost efficiency, time efficiency,
and token efficiency. The method does not define one combined resource score.

## Uncertainty changes the claim

A hierarchical bootstrap resamples independence clusters and tasks. Each
iteration rebuilds the network, refits the model, and recalculates the Pareto
front.

The output reports score intervals, rank distributions, valid iterations, and
the rate at which the network remains connected. A fragile network receives an
`unstable_network` status.

Pareto output reports the probability that a system is not dominated. It does
not turn an uncertain frontier into a categorical claim.

## Global scores are decision views

Family scores can be combined under a published weight profile. Each profile
defines its family weights, required coverage, anchor profile, and version.

No weight profile is a universal ranking. Different users can value software
engineering, terminal work, and general coding differently.

Systems enter the same global or Pareto view only when they cover the same task
families. A missing family never becomes zero.

## Interpretation limits

The method estimates relative performance from published evidence. It cannot
remove every difference in prompts, infrastructure, benchmark versions,
prices, or accounting rules. It does not reproduce one controlled experiment.

Use the results to select systems for further testing. Before deployment, test
the candidates on the repositories, tasks, and constraints that matter to you.
