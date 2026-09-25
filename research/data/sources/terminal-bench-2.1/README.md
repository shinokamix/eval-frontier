# Terminal-Bench 2.1

The pinned leaderboard contains 22 configurations over 89 tasks. Run
`uv run --project research eval-frontier capture-harbor terminal-bench-2.1`
to capture its JSON, every row's trial associations, and the associated jobs'
trial metadata through Harbor CLI. The manifest records CLI version 0.23.0,
the commands, and the hashes of their JSON output. The captured bytes fix the
reviewed state. A later leaderboard change requires another audit.
The earlier HTTP and HTML snapshots were removed after the CLI capture matched
their leaderboard and all 9,790 associated trial IDs and used values.

The adapter retains leaderboard aggregates and known trial costs. For the
leaderboard, `row:N` means the Nth member of `rows`. For a job trial page, it
means the Nth member of `items`. The captured row association lists establish
which job trials belong to each leaderboard row. Keep trial costs and their
aggregate total out of the same likelihood. Missing costs remain absent.

## Analysis readiness

Checked snapshot [aae91b21135f](raw/aae91b21135f4416d8229edd5c53666973c459c179ac35e24bfd958c805a4526/manifest.json).
Reproduce every row's coverage, sums, retries, and agent versions with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality is usable as published accuracy and standard error, subject to the
447-versus-445 attempt discrepancy below. Accuracy includes errors and reward
hack disqualifications as failures. Pass@2 through pass@5 are separate task-level
estimators. Raw trial rewards are not substituted for disqualification-adjusted
accuracy.

Cost has a reconciled, complete data subset of 8 of 22 rows. The captured row
associations contain 9,790 trials and 8,958 known costs. Seventeen totals match
within $0.0051; nine of those still have incomplete coverage. Five totals differ:

| Configuration | Sum of known costs, USD | Published total, USD |
| --- | ---: | ---: |
| Fable 5, xhigh | 366.3657 | 552.67 |
| Fable 5, high | 70.1951 | 438.64 |
| Grok 4.5, high | 132.0741 | 134.09 |
| GPT-5.6 Terra, max | 406.5122 | 421.15 |
| Opus 4.7, max, row `fdb8393b` | 592.8177 | 599.52 |

The last row reports 447 attempts but has 445 associated trials. Keep its
trial details separate from the published aggregate until the discrepancy is
explained. The earlier Fable 5 submission PR also used different trial IDs;
submission links and shared jobs are not substitutes for row associations.

Confirm the charges included in USD costs and explain these mismatches before
admitting affected rows. Candidate complete-cost links to SWE-Marathon,
DeepSWE, and Terminal-Bench 4.0 survive the coverage checks. Review settings and
campaign overlap before fitting.

The adapter retains total, cached input, and output tokens. It omits
`uncached_input_tokens` because rows mix input-minus-cache and all-input
conventions. Duration is a mean over trials with timestamps, with no confirmed
coverage. Neither tokens nor duration substitutes for USD cost.

The published results have no stated license or redistribution terms. The
snapshot contains public trial metadata, not trajectories or task definitions.
