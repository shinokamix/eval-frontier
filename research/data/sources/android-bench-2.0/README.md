# Android Bench 2.0 source notes

This source reads the [official Android Bench leaderboard](https://developer.android.com/bench)
and the [2.0 methodology](https://developer.android.com/bench/methodology/2).
The 2.0 table reports aggregate results for 30 long-horizon tasks. It lists
pass rate, a reported confidence interval, completion rate, mean latency for
a full benchmark run, and mean cost for a full run. The adapter extracts the
four measurements and the pass-rate interval for each model and agent pair.
Latency is converted from hours to seconds. The table rounds displayed values
to one decimal place, so the evidence rows retain that precision.
Pass rate uses the shared `trial_success_rate_pct` metric. Completion is a
mean percentage, while latency and cost cover a full 30-task benchmark run;
those three use generic IDs with their distinct statistics and denominators.

The publisher presents these results in the leaderboard HTML, with no separate
2.0 results download. The site did not honor HTTP byte-range requests, so the
snapshot contains the complete page. The adapter reads only the first results
table, which is identified by its 30-task description. The same page also
contains Android Bench 1.0 results; the adapter ignores those. The manifest
records the capture time and SHA-256 hash, and `pins.json` fixes the revision.
Each evidence locator is the line where a 2.0 leaderboard row begins.

The site has a [general content license](https://developer.android.com/license),
but it does not identify whether the leaderboard results fall under its
documentation or other-content category. The source metadata records the
results license and redistribution terms as `not stated`.

The methodology says pass rate counts runs with a perfect score and completion
rate measures partial task completion. The published table reports aggregate
values, not individual runs. No task-level evidence or inferred sample size is
added here. The methodology also cautions that latency includes network time
and that lower costs can reflect runs that stopped early.
