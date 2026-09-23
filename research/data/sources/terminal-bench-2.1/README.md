# Terminal-Bench 2.1 leaderboard

The results artifact is the public `main` leaderboard for the Harbor Hub dataset
`terminal-bench/terminal-bench-2-1`. The snapshot contains 22 published
configurations. Each `row:N` locator points to the Nth element of its `rows`
array, counting from one. The API returns the JSON on one physical line.

The publisher defines accuracy as successful trials divided by all trials,
including errored trials. `pass_at_2` through `pass_at_5` are task-level
estimates, averaged across 89 tasks. Cost and token values are totals across
trials. Average duration is wall-clock seconds for trials with timestamps; the
published response does not give the number of trials with both timestamps.
The source stores accuracy as a percentage and pass@k as fractions, so the
crosswalk keeps separate metric IDs and units.
`reward_hacks` is the percentage of trials disqualified for reward hacking.
The publisher counts those trials as failures in accuracy and pass@k, while
retaining their resource usage in the cost and token totals.

The adapter records published total, cached input, and output tokens. It omits
`uncached_input_tokens`: 16 rows match the [2.1 generator's](https://github.com/harbor-framework/terminal-bench-2-1/blob/67f1daf5b331fd10f5e8bc05bfc626aac26eeb39/leaderboard/src/leaderboard/core/metrics.py#L127-L152)
definition of input minus cached input, while five Codex GPT-6 Astra rows
match the [4.0 generator's](https://github.com/harbor-framework/terminal-bench/blob/37d0c6e752365435ac58677d1d425b8e4c07cb31/leaderboard/src/leaderboard/core/metrics.py#L150-L175)
definition of all input. One row has no cached input, so the conventions are
indistinguishable there. The pinned JSON keeps the published field. The snapshot
does not explain why the five Codex rows use a different convention.

The API does not state coverage for reported costs or token totals, so those
measurements have no sample size.

The results API does not state a license or redistribution terms. The archive
contains only the leaderboard response needed for the evidence rows. It does
not capture trial trajectories or the benchmark tasks.
