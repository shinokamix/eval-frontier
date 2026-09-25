# DeepSWE v1.1

The [official leaderboard](https://deepswe.datacurve.ai/data/v1.1) supplies 70
configuration aggregates for 28 models using `mini-swe-agent`. The new snapshot
preserves the original leaderboard and adds the
[trial export](https://deepswe.datacurve.ai/artifacts/v1.1/trials.json).

The adapter retains published aggregates and all 31,617 trials. Aggregate
`row:N` locates the configuration's JSON line; trial `row:N` locates the Nth
member of `trials.json.rows`. Trial rows contain task, trial, outcome, error
category, and known cost. Aggregate pass@1 retains its published interval.
Use either trial observations or their aggregates, not both as independent data.

## Analysis readiness

Checked snapshot [d7a3b8003e4e](raw/d7a3b8003e4e7e4d0ced630910ea4c2bc7050d2c1f82a712327ac884669b7319/manifest.json).
Reproduce counts and configuration lists with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality is usable at trial level. All 70 configurations reproduce the published
scored counts, passes, and task counts. The publisher excludes 155 provider,
verifier, or network errors. Attempted-task analysis retains these as unsuccessful
attempts; `condition=excluded_error` and `failure_type` preserve that distinction.
Agent timeouts and context-window failures already count as scored failures.
Pass@4 remains a separate outcome.

Cost has a usable data subset of 61 of 70 configurations with complete coverage.
There are 31,519 known costs. Missing costs comprise 72 excluded errors and
26 scored attempts; 83 excluded errors have known costs. All published cost
means match known-cost scored attempts, not all attempts. The adapter records
the corresponding observed count. Duration means also reconcile.

The leaderboard specifies token prices for five GPT-6 Astra effort settings,
without a separate compute-unit fee. Other configurations lack `cost_basis`.
Confirm their accounting and pricing basis before primary cost synthesis.
Candidate shared systems connect DeepSWE to both Terminal-Bench versions.
Review campaign overlap and settings before admitting these links.

The results files have no stated license or redistribution terms. The separate
code repository's Apache-2.0 license does not establish results terms.
