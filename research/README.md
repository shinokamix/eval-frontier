# Research pipeline

The current pipeline builds the canonical evidence table. It captures
immutable source snapshots, extracts source-native rows, maps source labels to
canonical IDs, validates every row with Pydantic, and writes Parquet.

```text
research/data/sources
        -> source extractors
        -> evidence.parquet
```

Run the configured checks and build from the repository root through Moon:

```bash
moon run research:check
moon run research:build
```

`research:check` compiles the Python source. The project also defines `lint`,
`format`, `types`, and `deps` tasks for Ruff, Basedpyright, and Deptry.

The build output is:

```text
research/data/canonical/evidence.parquet
```

The research code does not fit a model or produce the target graph. See the
[`methodology`](../docs/METHODOLOGY.md) for the planned analysis.

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

`source.json`, `manifest.json`, and `crosswalk.json` are JSON metadata. The raw
archive is immutable. Each `normalized.parquet` contains the canonical schema
for one source snapshot. See [`DATASETS.md`](../docs/DATASETS.md) for the row
contract and catalog details.

## Code layout

The Pydantic models live in `src/eval_frontier/schemas/`. Source archive code
lives in `src/eval_frontier/sources/`, adapters live in
`src/eval_frontier/sources/adapters/`, and canonicalization and Parquet writing
live in `src/eval_frontier/evidence/`.
