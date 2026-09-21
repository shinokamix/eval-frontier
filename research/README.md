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
calculation. [`../docs/VALIDATION.md`](../docs/VALIDATION.md) defines the tests
required before publication.

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
- study contrast and analysis-system mapping tables.
- comparison-network components.
- Bayesian hierarchical random-effects network models.
- posterior system and pairwise estimates.
- decision profiles and posterior utilities.
- cross-study diagnostics and sensitivity analysis.
- probabilistic cross-study Pareto views.

## Current evidence coverage

The committed extracted data has 1,684 task-level rows. Kroda contributes 1,456
rows with solved status, duration, cost, and token accounting. The four
OpenBench snapshots contribute 228 rows with solved status, score, wall time,
and tokens. Each OpenBench snapshot covers three task labels. The Aarora source
has an archived snapshot but no extracted observation file yet.

This is enough to build the normalization layer, local paired-contrast
estimator, covariance calculation, and synthetic end-to-end fixtures. It is not
enough to validate every input path in method version `2.0`. The archive has no
published-contrast fixture, no aggregate result with reported uncertainty, no
reported covariance matrix, and no independent aggregate multi-outcome
example. Cost currently comes from one evaluation campaign.

The first implementation should therefore publish task-level evidence and
within-study charts. Cross-study network and probabilistic Pareto results stay
experimental until the source archive contains connected independent campaigns
and exercises every production estimator used by the selected view.

## Implementation plan

Method version `2.0` has three implementation stages.

1. Normalize task-level inputs, review metric and configuration mappings, and
   calculate paired local contrasts and sampling covariance. Publish only
   within-study quality and resource charts. Use synthetic fixtures for the
   aggregate and published-contrast schemas. Define the target tables as
   Pydantic models and generate JSON Schema, Arrow schema metadata, TypeScript
   types, and the web validator from them.
2. Add univariate random-effects networks for binary quality, bounded scores,
   and per-attempt resources. Publish pairwise and anchor-relative effects only
   for connected components that pass the publication gates. Do not publish a
   frontier or joint probabilities at this stage.
3. Add stable decision-system mappings, joint multi-outcome models, decision
   profiles, and probabilistic Pareto views. Enable these views only when one
   multivariate model supplies their joint draws.

Each stage writes only the artifacts it implements. The manifest marks other
artifacts as unsupported. The pipeline cannot publish placeholder values under
method version `2.0` names.
