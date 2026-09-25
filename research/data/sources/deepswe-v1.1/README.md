# DeepSWE v1.1

The [official leaderboard](https://deepswe.datacurve.ai/data/v1.1) supplies 70
configuration aggregates for 28 models using `mini-swe-agent`. The snapshot
preserves the original leaderboard and adds the
[trial export](https://deepswe.datacurve.ai/artifacts/v1.1/trials.json).

## Extraction

The adapter retains published aggregates and all 31,617 trials. Aggregate
`row:N` locates the configuration's JSON line; trial `row:N` locates the Nth
member of `trials.json.rows`. Trial rows contain task, trial, outcome, error
category, and known cost. Aggregate pass@1 retains its published interval.

`outcome_status` keeps the publisher's outcome. `scored=false` marks provider,
verifier, or network errors the publisher excludes from its score. Published
cost and duration means cover scored attempts with a known value; the adapter
records that observed count as the aggregate's sample size. It checks that
trials reproduce every configuration's scored counts, passes, task counts, and
cost and duration means.

## Terms

The results files have no stated license or redistribution terms. The separate
code repository's Apache-2.0 license does not establish results terms.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
