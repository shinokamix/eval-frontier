# FrontierCode 1.1

[Cognition's leaderboard](https://cognition.com/frontiercode) supplies a JSON
file with versions 1.0 and 1.1. The adapter retains only `v1_1`, including all
effort levels. Its 230 Main and Extended aggregates represent 115 system IDs
across 40 model labels. `row:N` locates the subset object in the captured JSON.

The adapter keeps binary correctness separate from weighted rubric score.
It converts correctness to percent and duration to seconds. Cost remains USD
per rollout; output tokens remain mean output tokens per rollout. Null values
stay absent. `Kimi K2.7` remains distinct from `Kimi K2.7 Code` because the
publisher does not equate those labels.

## Analysis readiness

Checked snapshot [e0663f1222fb](raw/e0663f1222fb90127abda3872a68a592e8e3566fe1b4ab59db1ffdefa650ba89/manifest.json).
Reproduce counts and configuration lists with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality is descriptive only until actual denominators and error handling are
established. Main has 100 tasks and Extended 150. The original methodology
mentions five runs, but some 1.1 fractions are inconsistent with 500 or 750
binary attempts. `sample_size` therefore stays null. The
[1.1 methodology](https://cognition.com/blog/frontier-code-1.1) also assigns zero
score to runs flagged for unfair internet use.

Cost is descriptive only. The published means have no confirmed coverage or
spread. The earlier online audit found the same aggregates and no trial export.
Obtain actual attempt counts and outcome and cost details from the publisher
before including either axis in the primary analysis.

Main and Extended campaign independence is unresolved. Matching system IDs with
SWE-Marathon and Terminal-Bench are candidate links, not evidence that this
source can currently connect the analysis network.

The results JSON has no stated license or redistribution terms.
