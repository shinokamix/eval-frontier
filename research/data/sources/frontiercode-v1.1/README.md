# FrontierCode 1.1 source notes

This source uses [Cognition's official leaderboard](https://cognition.com/frontiercode)
and its [FrontierCode 1.1 methodology](https://cognition.com/blog/frontier-code-1.1).
The page loads `data/frontiercode-leaderboard/data.json`, which contains both
versions 1.0 and 1.1. The adapter reads only `v1_1`. The URL can change; the
manifest records the captured bytes, time, and SHA-256 hash.

The 1.1 data has 230 model, effort, and subset aggregates across 40 model
labels. Main has 100 tasks and Extended has 150. The original methodology
describes five runs per task and effort, but the captured 1.1 results do not
report an actual count for each aggregate. Some published pass rates are also
inconsistent with 500 or 750 binary outcomes. The adapter leaves `sample_size`
null rather than assigning an unsupported count. It keeps every effort,
rather than selecting the best score as the web page does by default. A row
locator points to the subset object in the captured JSON.

The [original methodology](https://cognition.com/blog/frontier-code) defines
pass rate as the share of solutions clearing all blocking criteria. Score is
the mean weighted rubric result, with a zero for a solution that fails a
blocker. Under the 1.1 rules, runs flagged for unfair internet use also get
zero score. The adapter keeps `correct` and `new_score` as separate metrics.
It converts the source's `correct` fraction to percent for the shared
`trial_success_rate_pct` metric, and `duration_min` to seconds for the shared
`mean_trial_duration_s` metric. It also stores the leaderboard's flag rate,
cost per rollout, output tokens, and tool-call and step means where present.
Null metrics stay absent. These are published aggregates, not task-level
observations. Cost per rollout differs from DeepSWE's cost per scored attempt;
mean output tokens differ from total tokens across trials.

The leaderboard does not state a license or redistribution terms for its
results JSON. The source metadata records both as unstated. `Kimi K2.7` is
kept distinct from the catalog's `Kimi K2.7 Code` because the publisher does
not identify those labels as the same model.
