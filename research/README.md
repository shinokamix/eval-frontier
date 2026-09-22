# Research pipeline

The current pipeline only builds the canonical evidence table. It captures
immutable source snapshots, extracts source-native rows, maps source labels to
canonical IDs, validates every row with Pydantic, and writes Parquet.

```text
research/data/sources
        -> source extractors
        -> evidence.parquet
```

Run commands from the repository root through Moon:

```bash
moon run research:check
moon run research:build
```

The build output is:

```text
research/data/canonical/evidence.parquet
```

The research code does not currently fit a model, aggregate study results,
build pairwise comparisons, or produce the target quality against
`cost_per_task` graph. Use a notebook to inspect evidence and develop the
analysis. Put the final calculations in reproducible research code. The
[`methodology`](../docs/METHODOLOGY.md) defines the target graph and its checks.

## Data layout

```text
research/data/
  sources/<source-id>/
    source.json
    crosswalk.json
    raw/<snapshot-id>/
      manifest.json
      artifacts/
    extracted/<snapshot-id>/
      normalized.parquet
  canonical/
    evidence.parquet
    pins.json
```

`source.json`, `manifest.json`, and `crosswalk.json` are JSON metadata. The
normalized per-source tables and the combined research table are Parquet. The
raw archive is never modified by the pipeline. Each `normalized.parquet`
contains the same canonical evidence schema as the combined table, but only
the rows from its source snapshot.

## Python contracts

`src/eval_frontier/schemas/` contains the Pydantic models for canonical rows,
catalog entries, and source metadata. `catalog/` contains the allowed model,
harness, and metric values. There is no separate JSON Schema contract.

Source archive code lives in `src/eval_frontier/sources/`. Source-specific
adapters live in `sources/adapters/`. Canonicalization and Parquet writing live
in `src/eval_frontier/evidence/`.
