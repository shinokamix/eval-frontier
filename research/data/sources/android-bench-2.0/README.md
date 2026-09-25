# Android Bench 2.0

The [official leaderboard](https://developer.android.com/bench) publishes
11 configurations for 30 long-horizon tasks. The snapshot contains the whole
HTML page because the site did not honor byte ranges. The adapter reads the
2.0 leaderboard and its model cards, excluding the 1.0 section.

Published aggregates retain pass rate and its interval, completion rate, mean
latency, and mean cost per full 30-task run. Latency is converted to seconds.
The adapter also extracts 330 task pass rates, each with `sample_size=5` and
a task identifier taken from the published task title. It does not invent
individual trial identities. `row:N` identifies the HTML row's starting line.

## Analysis readiness

Checked snapshot [8959c641e118](raw/8959c641e1189fdc633f0d98b3ddff2b87cf649125d35bcfe531dc0fb8234ab9/manifest.json).
Reproduce counts and configuration lists with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality is usable as task-level counts. Each configuration has 30 tasks and
150 attempts. All task counts reproduce the displayed aggregate pass rate
within its rounding precision. Use task rows or configuration aggregates,
not both as independent observations. Completion rate is partial credit and
is not the binary success outcome.

Cost is descriptive only. Its denominator is a full benchmark run, while the
cards provide no individual costs or cost spread. Confirm coverage and the
meaning of the full-run mean before converting to a per-attempt cost. The
[methodology](https://developer.android.com/bench/methodology/2) cautions that
low costs can reflect early termination and latency includes network time.

Effort is unknown. The one matching system tuple with SWE-Marathon has null
effort on both sides, so it does not establish a cross-study link. Obtain
settings and trial costs before including this source in the common cost graph.

The site does not identify which category of its general content license covers
these results. Results license and redistribution terms remain unstated.
