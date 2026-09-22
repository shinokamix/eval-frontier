# Validation

The current validation scope is the canonical evidence table.

Each source build must:

- verify the immutable snapshot checksum;
- resolve every source model, harness, and metric through a crosswalk;
- validate every row with the Pydantic `EvidenceRow` model;
- preserve missing values as null;
- preserve source path and row provenance;
- write a deterministic Parquet schema and row order.

The pipeline must fail on an unknown canonical ID, malformed numeric value,
missing required identity field, or missing source provenance.

Statistical validation, model diagnostics, decision checks, and Pareto checks
are deferred until a later analysis stage exists.
