# Canonical evidence data

This pipeline stage converts heterogeneous source artifacts into one validated
evidence table. The target graph of relative task success against relative
reported USD cost uses later analysis outputs. Statistical synthesis, posterior
draws, and the graph do not belong in this table.

## Pipeline

```text
source artifacts
    -> source-specific extraction
    -> Pydantic validation
    -> sources/<source-id>/extracted/<snapshot-id>/normalized.parquet
    -> evidence.parquet
```

The raw source archive remains immutable. Extractors may understand different
source formats, but every extractor emits the same canonical rows.

## Canonical artifact

`research/data/canonical/evidence.parquet` is the single canonical dataset.
The build also keeps one `normalized.parquet` per pinned source snapshot under
`research/data/sources/<source-id>/extracted/<snapshot-id>/`. These files use
the same schema and contain only that source's rows, which makes source-level
inspection and debugging possible without rebuilding the combined table.

Parquet is the storage format because the research code is Python-based and
the table is intended for pandas, Polars, PyArrow, and notebooks. JSON is used
only for source manifests, immutable snapshot metadata, and source crosswalks.

## Row grain

One row represents one measurement for one task or aggregate result:

```text
study × benchmark × task × trial × model × harness × effort × metric
```

The table is in long format. A single experiment therefore produces several
rows, one for each reported metric such as `solved`, `quality`, `duration_s`,
or `total_tokens`.

## Evidence row

The Pydantic `EvidenceRow` model in
`research/src/eval_frontier/schemas/evidence.py` is the source of truth for the
table.

### Provenance

```text
source_id
snapshot_id
study_id
source_path
source_locator
```

`source_path` and `source_locator` point back to the immutable source artifact.
Every published value must be traceable to that location.

### Experiment identity

```text
benchmark_id
benchmark_version
task_id
trial_id
attempt_id
condition
```

Trial-level sources fill in task and trial identifiers. Task-level aggregates
retain `task_id` and their sample size, with no invented trial identifiers.
Configuration aggregates leave both identifiers null. Sources may retain both
aggregate and detailed representations; analysis must select one representation
of each outcome to avoid counting the same attempts twice.

### System configuration

```text
model_id
harness_id
effort
```

These fields identify the evaluated system. The canonical values live as
Pydantic catalog instances in `research/src/eval_frontier/catalog/`.

The current catalog defines model, harness, and metric IDs. Source-specific
names are mapped to those IDs by `crosswalk.json` before a row is written.
The crosswalk itself is validated with the Pydantic `SourceCrosswalk` model.

### Measurement

```text
metric_id
value
unit
statistic
direction
```

`metric_id` refers to a value in the canonical metric catalog. A metric
definition states its unit, statistic, and whether higher or lower values are
preferred. The source value itself is never silently converted into a
different statistic or denominator.

### Optional uncertainty and execution fields

```text
sample_size
standard_error
interval_lower
interval_upper
timed_out
failure_type
```

These fields support aggregate publications and execution failures without
forcing task-level sources to invent values.

## Canonical catalogs

The catalogs are ordinary Python data validated by Pydantic models. They are
not separate datasets and do not need JSON Schema files.

```python
from eval_frontier.catalog import HARNESSES, METRICS, MODELS
```

`schemas/` defines the shapes. `catalog/` defines the allowed values.
Source `crosswalk.json` files map native labels to those stable IDs.

## What this stage does not produce

This stage does not build:

- study-level aggregates;
- pairwise comparisons;
- covariance matrices;
- Bayesian model runs;
- posterior draws or estimates;
- decision scores;
- Pareto results.

Those are later transformations over `evidence.parquet`. They must not be
stored in the canonical evidence table.

## Current build checks

For each pinned source, the build verifies the captured snapshot checksum,
resolves source labels through its crosswalk, and validates every output row
with `EvidenceRow`. Missing optional values remain null. Each row retains its
source path and locator. The Parquet schema and row order are deterministic.

An unknown canonical ID, malformed number, missing required identity field,
or missing source provenance stops the build. Statistical checks for derived
results are planned in [`METHODOLOGY.md`](METHODOLOGY.md).
