# Terminal-Bench 4.0 leaderboard

The results artifact is the public `4-0-0` leaderboard for the Harbor Hub
package `terminal-bench/terminal-bench`, dataset version 4.0.0. The captured
snapshot contains 27 published configurations. Each `row:N` locator points to
the Nth element of its `rows` array, counting from one. The API returns the
JSON on one physical line. The publisher's
[v4.0.0 dataset manifest](https://github.com/harbor-framework/terminal-bench/blob/v4.0.0/tasks/dataset.toml)
lists 66 tasks.

Each configuration reports 330 trials over 66 tasks, with five trials per
task. Accuracy is the percentage of successful trials, including failures in
the denominator. This matches the published `successes` and `n_trials` fields.
The source stores accuracy as a percentage and pass@k as fractions. All 27
pass@k rows are consistent with the five-trial task estimator averaged over
66 tasks, but this API response does not document the estimator. Cost and
token counts are reported totals. Average duration is reported in seconds;
the response does not give its denominator.

The adapter records published total, cached input, and output tokens. It omits
`uncached_input_tokens`: the [4.0 generator](https://github.com/harbor-framework/terminal-bench/blob/37d0c6e752365435ac58677d1d425b8e4c07cb31/leaderboard/src/leaderboard/core/metrics.py#L150-L175)
uses this name for all input tokens, including cached input. This matches 26
rows. Grok 4.7 instead matches the [2.1 generator](https://github.com/harbor-framework/terminal-bench-2-1/blob/67f1daf5b331fd10f5e8bc05bfc626aac26eeb39/leaderboard/src/leaderboard/core/metrics.py#L127-L152),
which subtracts cached input. The pinned JSON keeps the published field. The
snapshot does not explain why the Grok row uses a different convention.

The adapter records the published 95% accuracy interval as lower and upper
bounds by subtracting and adding `accuracy_ci95_half_width` to the published
accuracy. The original half-width remains in the raw artifact.

The Grok 4.7 cost covers 324 of 330 trials, as the published display string
states. Its cost measurement has `sample_size=324`. The API does not state cost
coverage for other rows or trial coverage for token totals and average duration,
so those measurements have no sample size. The partial Grok cost cannot be
divided by 330 to estimate cost per attempted task.

The results API does not state a license or redistribution terms. The archive
contains only the leaderboard response needed for the evidence rows. It does
not capture trial trajectories or benchmark tasks.
