# FrontierCode 1.1

[Cognition's leaderboard](https://cognition.com/frontiercode) supplies a JSON
file with versions 1.0 and 1.1. The adapter retains only `v1_1`, including all
effort levels. Its 230 Main and Extended aggregates represent 115 system IDs
across 40 model labels.

## Extraction

`row:N` locates the subset object in the captured JSON, and `campaign_id`
names the subset: `main` (100 tasks) or `extended` (150 tasks). The adapter
keeps binary correctness separate from weighted rubric score. It converts
correctness to percent and duration to seconds. Cost remains USD per rollout;
output tokens remain mean output tokens per rollout. Null values stay absent.
`Kimi K2.7` remains distinct from `Kimi K2.7 Code` because the publisher does
not equate those labels.

`sample_size` stays null: the original methodology mentions five runs, but
some 1.1 fractions are inconsistent with 500 or 750 binary attempts. The
[1.1 methodology](https://cognition.com/blog/frontier-code-1.1) assigns zero
score to runs flagged for unfair internet use.

## Terms

The results JSON has no stated license or redistribution terms.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
