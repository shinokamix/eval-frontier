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

For the five GPT-6 Astra rows, the published `total_tokens` equals
`uncached_input_tokens + output_tokens` and excludes `cached_input_tokens`.
The adapter preserves the three published token fields separately. Do not add
them to reproduce `total_tokens` for those rows.

The results API does not state a license or redistribution terms. The archive
contains only the leaderboard response needed for the evidence rows. It does
not capture trial trajectories or the benchmark tasks.
