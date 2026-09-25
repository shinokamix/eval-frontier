# Android Bench 2.0

The [official leaderboard](https://developer.android.com/bench) publishes
11 configurations for 30 long-horizon tasks. The snapshot contains the whole
HTML page because the site did not honor byte ranges. The adapter reads the
2.0 leaderboard and its model cards, excluding the 1.0 section.

## Extraction

Published aggregates retain pass rate and its interval, completion rate, mean
latency, and mean cost per full 30-task run. Latency is converted to seconds.
The adapter also extracts 330 task pass rates, each with `sample_size=5` and
a task identifier taken from the published task title. It does not invent
individual trial identities. `row:N` identifies the HTML row's starting line.
The adapter checks that task counts reproduce each displayed pass rate.

Completion rate is partial credit. Latency includes network time, according to
the [methodology](https://developer.android.com/bench/methodology/2).

## Terms

The site does not identify which category of its general content license covers
these results. Results license and redistribution terms remain unstated.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
