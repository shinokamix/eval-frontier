---
name: add-source
description: Use when adding a benchmark or evaluation results source to eval-frontier's research pipeline.
---

# Add a source

Follow [the source guide](../../../docs/SOURCE-PIPELINE.md). Before editing,
inspect the source's published results, its revision and redistribution terms,
and an existing source with a similar result format.

Complete the intake through the rebuilt evidence table. Check that the pinned
snapshot verifies and the adapter extracts at least one row. Map every emitted
model, harness, and metric label to the intended canonical ID. Inspect both
Parquet outputs. Confirm that the new rows carry the source ID and snapshot ID.
Check that `source_path` names the results artifact and `source_locator` names
its row. Explain any changes to existing source rows.

If you cannot establish a fixed revision, redistribution terms, a results
artifact, or the meaning of a label, stop before capture and report the exact
missing fact. Do not invent a canonical mapping to make the build pass.
