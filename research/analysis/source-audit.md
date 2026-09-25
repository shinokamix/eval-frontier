# Current data readiness

The [source audit notebook](notebooks/source_audit.py) checks the existing evidence against
pinned snapshots. After updating a source, run `moon run research:build` first.
The notebook shows configuration-level coverage, mismatches, and candidate links. Source READMEs hold the decisions and
artifact links. Use [the same process](../../docs/SOURCE-PIPELINE.md) for a new
source or snapshot.

Readiness below concerns the outcomes in [METHODOLOGY.md](../../docs/METHODOLOGY.md).
Complete cost data still need a review of the charges included before primary
cross-study synthesis. Aggregates and their underlying trials are the same evidence.

| Source | Quality | Cost | Next action |
| --- | --- | --- | --- |
| [SWE-Marathon](../data/sources/swe-marathon-v1.1/README.md) | 7,810 binary trial outcomes usable. | 39 of 49 configurations have complete costs. | Confirm accounting basis and compare task coverage and settings across studies. |
| [Terminal-Bench 2.1](../data/sources/terminal-bench-2.1/README.md) | CLI capture matches the prior leaderboard; published accuracy and SE usable. One count mismatch needs review. | 8 of 22 rows have complete costs and matching totals. | Explain five total mismatches and the 447-versus-445 attempt count; confirm accounting. |
| [Terminal-Bench 4.0](../data/sources/terminal-bench-4-0/README.md) | CLI capture matches the prior leaderboard; published accuracy and intervals available. Seven rows need retry review. | 15 of 27 rows have complete costs and matching totals; 13 also lack retry flags. | Explain two total mismatches and retry handling; confirm accounting. |
| [DeepSWE](../data/sources/deepswe-v1.1/README.md) | 31,617 attempted outcomes usable; all 70 scored aggregates reconcile. | 61 of 70 configurations have complete costs. | Confirm accounting for configurations without `cost_basis`; review shared-system settings. |
| [Android Bench](../data/sources/android-bench-2.0/README.md) | 330 task counts usable, five runs each. | Descriptive only; coverage and spread unknown. | Obtain effort settings and full-run cost details. |
| [FrontierCode](../data/sources/frontiercode-v1.1/README.md) | Descriptive only; denominators unknown. | Descriptive only; coverage and spread unknown. | Obtain actual attempt counts and trial details; resolve Main/Extended campaign overlap. |

## Start analysis

SWE-Marathon, DeepSWE, and both Terminal-Bench versions remain connected by
candidate shared systems after restricting costs to complete, reconciled rows
with known effort and no unresolved retry flags. FrontierCode is not needed to connect this group. Android's
only exact shared tuple has unknown effort and cannot establish a link.
These are data-supported candidates, not approved modeling assumptions.

Review the surviving systems' settings, cost accounting, and campaign overlap.
Then choose a reference and target campaigns and calculate within-study
comparisons. The notebook lists the exact systems on each candidate cost link.
It finds no shared trial IDs across sources; that does not prove independent
campaigns or disjoint tasks. Keep sources with missing information available
for descriptive analysis while resolving their limits.
