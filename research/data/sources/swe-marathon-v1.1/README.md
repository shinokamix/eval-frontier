# SWE-Marathon v1.1

The [official site](https://www.swe-marathon.org/) embeds trial results in a
JavaScript bundle. The snapshot contains the complete results JSON from bytes
1,054,612 through 5,121,794. It has 20 tasks and 7,810 trials.

## Extraction

The adapter extracts binary reward as `solved`, reported USD cost, tokens, and
duration. Missing costs remain absent. Uncalibrated partial scores are omitted.
`outcome_status` retains execution status; execution `success` does not mean
the task was solved. `row:N` locates the Nth trial in nested task,
configuration, and trial order, starting at one.

## Terms

Results redistribution terms are unstated. The site's Apache-2.0 footer and
related code and task licenses do not separately license the results JSON.

## Review

Analysis decisions for the pinned snapshot live in [`review.json`](review.json).
The [source audit notebook](../../../analysis/notebooks/source_audit.py)
reproduces the counts behind them.
