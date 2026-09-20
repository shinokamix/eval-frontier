# Adjudication of the later data package

The update source supplied for this artifact was the directory `xbow-paper-data-full` (the on-disk name differs from the originally requested `xbow-paper-full-data`).

The row-level files agree with one another:

- `xbow_runs_long.csv`: 1,456 unique condition/challenge rows.
- `xbow_solve_matrix.csv`: the same 14 conditions over the same 104 challenges.
- `xbow_challenge_metadata.csv`: the same challenge levels and tags as the former artifact.
- `codex_sysprompt_p2`: 104 rows, 68 solves, with 75 unique solves across the two whole-system trials.

All 1,352 rows already present in the former artifact match the long export on solve outcome, total tokens, and tool calls exactly; cost and duration differ only by display rounding. `data/full_run_summary.csv` is a byte-for-byte copy of the supplied long export.

## Missing fields in the recovered trial

The long export lacks input/cached/output token splits, `cost_aborted`, `exit_code`, and `timed_out` for every condition. Those fields could be preserved for the former 1,352 rows but cannot be reconstructed for the recovered 104-row whole-system trial. They remain empty, and final-cost threshold contact is labeled as a proxy.

The unmodified solve matrix and environment notes plus their SHA-256 hashes are retained in `source/`.
