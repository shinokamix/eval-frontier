# Terminal-Bench 2.1

The pinned leaderboard contains 22 configurations over 89 tasks. Run
`uv run --project research eval-frontier capture-harbor terminal-bench-2.1`
to capture its JSON, every row's trial associations, and the associated jobs'
trial metadata through Harbor CLI. The manifest records CLI version 0.23.0,
the commands, and the hashes of their JSON output. The captured bytes fix the
reviewed state. A later leaderboard change requires another audit.
The earlier HTTP and HTML snapshots were removed after the CLI capture matched
their leaderboard and all 9,790 associated trial IDs and used values.

## Extraction

The adapter retains leaderboard aggregates and known trial costs. For the
leaderboard, `row:N` means the Nth member of `rows`. For a job trial page, it
means the Nth member of `items`. The captured row association lists establish
which job trials belong to each leaderboard row, and `campaign_id` holds the
row ID. Trial rows keep `scored`, `attempt_count`, and `agent_version`; a
trial with `attempt_count` above one had retries. Missing costs remain absent.
`sources/reconcile.py` compares every row's trials with its published count
and total cost.

Accuracy includes errors and reward hack disqualifications as failures and
retains its published standard error. Pass@2 through pass@5 are task-level
estimators.

The adapter retains total, cached input, and output tokens. It omits
`uncached_input_tokens` because rows mix input-minus-cache and all-input
conventions. Duration is a mean over trials with timestamps, with no confirmed
coverage.

The earlier Fable 5 submission PR used different trial IDs from its
leaderboard rows; submission links and shared jobs are not substitutes for row
associations.

## Terms

The published results have no stated license or redistribution terms. The
snapshot contains public trial metadata, not trajectories or task definitions.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
