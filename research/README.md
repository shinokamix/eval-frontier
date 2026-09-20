# Research pipeline

Moon runs this Python project. The pipeline captures source artifacts, extracts
observations, harmonizes labels, aggregates study results, and writes the JSON
artifact consumed by the web app.

```text
research/data/canonical + research/data/sources
        -> Python pipeline
        -> research/build/research.json + manifest.json
```

Run commands from the repository root through Moon:

```bash
moon run research:check
moon run research:build
```

The Python package lives in `src/eval_frontier`. Source snapshots and canonical
catalogs live in `data`. The web app is the only consumer of the generated
`research/build/research.json` file.

[`../docs/DATASETS.md`](../docs/DATASETS.md) defines the research data contract.
[`../docs/SCORING.md`](../docs/SCORING.md) defines the planned cross-study
calculation.

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
      observations.json
  canonical/
    models.json
    harnesses.json
    metrics.json
    pins.json
    studies.json
```

`source.json` describes a publication and its downloadable artifacts. Capture
stores immutable bytes under `raw`. The pinned snapshot in
`canonical/pins.json` is the only snapshot used by extract and build.

Missing values remain missing. The pipeline does not infer values from charts.
The committed build manifest records the source snapshot IDs and checksum for
the published result.

`research/build/research.json` is the public derived dataset. The web app copies
that file into its generated `public/data` directory, but the research build is
the canonical artifact for downloads and independent analysis.

## Adding a source

See [add-a-source.md](add-a-source.md). New extraction logic belongs in the
Python package under `src/eval_frontier`, not in the web app.

## Current implementation

The pipeline implements:

- immutable source snapshots.
- source-specific extraction.
- crosswalks and canonical catalogs.
- extracted observations for each source.
- aggregation within each study.
- Pareto calculations within each study.
- `research/build/research.json` for the web application.

The pipeline does not implement:

- the task-family taxonomy and review records.
- compatibility reviews and evidence assessments.
- `measurements.parquet` and the other target Parquet tables.
- local comparison and effect-size tables.
- comparison-network components.
- weighted Bradley-Terry fitting.
- anchored family scores and pairwise probabilities.
- decision profiles and global scores.
- cross-study uncertainty and sensitivity analysis.
