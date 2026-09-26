# Terminal-Bench 4.0

The pinned leaderboard contains 27 configurations over 66 tasks. Run
`uv run --project research eval-frontier capture-harbor terminal-bench-4-0`
to capture its JSON, every row's trial associations, and the associated jobs'
trial metadata through Harbor CLI. The manifest records CLI version 0.23.0,
the commands, and the hashes of their JSON output. The captured bytes fix the
reviewed state. A later leaderboard change requires another audit.
The earlier HTTP and HTML snapshots were removed after the CLI capture matched
their leaderboard and all 8,910 associated trial IDs and used values.

## Extraction

The adapter retains leaderboard aggregates and known trial costs. For the
leaderboard, `row:N` means the Nth member of `rows`. For a job trial page, it
means the Nth member of `items`. The captured row association lists establish
which job trials belong to each leaderboard row, and `run_id` holds the
row ID. Trial rows keep `scored`, `attempt_count`, and `agent_version`; a
trial with `attempt_count` above one had retries. Missing costs remain absent.
`sources/reconcile.py` compares every row's trials with its published count
and total cost.

Accuracy retains its 95% interval from `accuracy_ci95_half_width`, and the
adapter checks accuracy against published successes. Where the published total is
marked partial, as for Grok 4.7, its covered trial count becomes the total's
`sample_size`. Other aggregate cost sample sizes remain unknown. Public rows
show only scored attempt 1 for trials with retries.

The adapter retains total, cached input, and output tokens. It omits
`uncached_input_tokens` because rows mix input-minus-cache and all-input
conventions. Duration is a mean over trials with timestamps, with no confirmed
coverage.

## Terms

The published results have no stated license or redistribution terms. The
snapshot contains public trial metadata, not trajectories or task definitions.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
