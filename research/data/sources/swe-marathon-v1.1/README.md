# SWE-Marathon v1.1

The [official site](https://www.swe-marathon.org/) embeds trial results in a
JavaScript bundle. The snapshot contains the complete results JSON from bytes
1,054,612 through 5,121,794. It has 20 tasks and 7,810 trials.

The adapter extracts binary reward, reported USD cost, tokens, and duration.
Missing costs remain absent. Uncalibrated partial scores are omitted.
`condition` retains execution status. `row:N` locates the Nth trial in nested
task, configuration, and trial order, starting at one.

## Analysis readiness

Checked snapshot [2168608a042b](raw/2168608a042bdd5cd6a42d96eef64a73954c282dc6b226669174f41fdf4f8ddc/manifest.json).
Reproduce counts and configuration lists with
[the source audit notebook](../../../analysis/notebooks/source_audit.py).

Quality is usable at trial level. All 7,810 binary rewards are present.
Execution `success` does not mean the task was solved; use reward. Preserve task
clusters when comparing systems and check the attempted task mix.

Cost has a usable data subset of 39 of 49 configurations with complete coverage.
The other ten lack 762 costs. Four lack all 160 costs, one lacks 107 of 160,
and five account for the remaining 15. Of the missing-cost trials, 735 have
execution status `success`, 27 have `error`, and 216 have reward 1.
The notebook lists these configurations and missingness by outcome.
Known-cost means do not estimate all-attempt means without an assumption.

Shared system IDs connect this source to Terminal-Bench. Confirm the USD charges
covered and the comparability of system settings before using those links in
the primary cost model. Sampled trajectories did not expose structured costs
in the earlier online audit. Restricted S3 logs remain an unverified recovery
option, not a prerequisite for using the complete subset.

Results redistribution terms are unstated. The site's Apache-2.0 footer and
related code and task licenses do not separately license the results JSON.
