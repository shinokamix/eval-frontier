---
name: add-source
description: Use when adding a benchmark or evaluation results source to eval-frontier's research pipeline.
---

# Add a source

Follow [the source guide](../../../docs/SOURCE-PIPELINE.md). Before editing,
inspect the published results, the artifact URL, any stated license or
redistribution terms, and an existing source with a similar result format.
The captured bytes and their SHA-256 hashes fix the revision when a publisher
provides only a changing URL. Record unstated terms as `not stated` rather than
inferring permission from a related code repository.

Complete the intake through the rebuilt evidence table. Check that the pinned
snapshot verifies and the adapter extracts at least one row. Map every emitted
model, harness, and metric label to the intended canonical ID. Inspect both
Parquet outputs. Confirm that the new rows carry the source ID and snapshot ID.
Check that `source_path` names the results artifact and `source_locator` names
its row. Explain any changes to existing source rows.

If you cannot identify a public results artifact or the meaning of a label,
stop before capture and report the exact missing fact. Do not invent a
canonical mapping to make the build pass. If terms are not stated, capture
only the results needed for the evidence rows and report that limitation.
