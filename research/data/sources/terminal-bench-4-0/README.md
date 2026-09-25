# Terminal-Bench 4.0

The pinned leaderboard contains 27 configurations over 66 tasks. Run
`uv run --project research eval-frontier capture-harbor terminal-bench-4-0`
to capture its JSON, every row's trial associations, and the associated jobs'
trial metadata through Harbor CLI. The manifest records CLI version 0.23.0,
the commands, and the hashes of their JSON output. The captured bytes fix the
reviewed state. A later leaderboard change requires another audit.
The earlier HTTP and HTML snapshots were removed after the CLI capture matched
their leaderboard and all 8,910 associated trial IDs and used values.

The adapter retains leaderboard aggregates and known trial costs. For the
leaderboard, `row:N` means the Nth member of `rows`. For a job trial page, it
means the Nth member of `items`. The captured row association lists establish
which job trials belong to each leaderboard row. Keep trial costs and their
aggregate total out of the same likelihood. Missing costs remain absent.

## Analysis readiness

Checked snapshot [52d54cbec728](raw/52d54cbec728d566ca1eceabb6e585dd1b69f4a0f124c3626e19f1d7c3680fde/manifest.json).
Reproduce every row's coverage, sums, retries, and agent versions with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality retains published accuracy with its 95% interval. All 27 rows
report 330 trials over 66 tasks. Published successes reproduce accuracy. The
adapter retains the interval from `accuracy_ci95_half_width`. Pass@k remains a
separate outcome; task pairing requires a separate review of the trial rewards.

Cost has a reconciled, complete data subset of 15 of 27 rows. All row associations
contain 330 trials, with 8,876 known costs out of 8,910. Seventeen rows have
complete coverage, but two of their totals disagree:

| Configuration | Sum of known costs, USD | Published total, USD |
| --- | ---: | ---: |
| Opus 5, max | 6059.9996 | 5969.11 |
| GPT-5.6 Sol, max | 2598.1079 | 2541.70 |

The other 25 totals match within $0.0051, including ten with missing costs.
Grok 4.7 explicitly marks 324 of 330 costs and retains `sample_size=324` on its
published total. Other aggregate cost sample sizes remain unknown; the notebook
reports observed coverage separately. A matching partial sum cannot be divided
by 330 to estimate cost per attempted task.

Seven configurations have 36 trials with `n_attempts > 1`, representing 39
additional attempts. Their public rows show only scored attempt 1. Establish
whether published success denominators and costs include these retries before
converting to attempted-task outcomes. Two of the 15 complete, reconciled rows
have retries, leaving 13 without that extra uncertainty. The notebook excludes
retry-bearing rows from candidate cost links.

Confirm the USD accounting basis, retry handling, and the two mismatches before
admitting affected rows. Candidate complete-cost links to SWE-Marathon, DeepSWE, and
Terminal-Bench 2.1 remain. The two Terminal-Bench versions have different task
sets; inspect overlapping tasks and run identities before treating their
campaigns as independent.

The adapter retains total, cached input, and output tokens. It omits
`uncached_input_tokens` because rows mix input-minus-cache and all-input
conventions. Duration is a mean over trials with timestamps, with no confirmed
coverage. Neither tokens nor duration substitutes for USD cost.

The published results have no stated license or redistribution terms. The
snapshot contains public trial metadata, not trajectories or task definitions.
