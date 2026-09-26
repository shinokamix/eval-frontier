# Research pipeline

The current pipeline builds the canonical evidence table. It captures
immutable source snapshots, extracts source-native rows, maps source labels to
canonical IDs, validates every row with Pydantic, and writes Parquet.

```text
research/data/sources
        -> source extractors
        -> evidence.parquet
```

Run these from the repository root:

```bash
moon run research:build  # write the evidence table from pinned snapshots
moon run nb              # rebuild the table and open the notebooks
moon run check           # run every check
moon run fix             # fix formatting and lint errors in place
```

For this project, `check` runs Ruff, Basedpyright, Deptry, and `marimo check`.
Basedpyright also type-checks the notebooks, and `marimo check` catches
notebook structure errors, such as a variable defined in two cells.

The marimo notebook
[`analysis/notebooks/source_audit.py`](analysis/notebooks/source_audit.py)
shows cost coverage, reconciliation, and candidate links. It also holds the
exploratory analysis of the table and applies each source's reviewed decisions
in `review.json` to produce the readiness summary to read before starting
analysis.

You can edit a notebook in the browser or in a code editor. When you save it
in the editor, the browser reloads it and reruns the changed cells. Edit in one
place at a time: the browser autosaves, so the later save overwrites the other.
Autorun is set in `pyproject.toml`, which marimo reads only when started from
`research/`, as `moon run nb` does.

Source capture is a separate step. For new or updated sources, follow
[the source process](../docs/SOURCE-PIPELINE.md).
Terminal-Bench snapshots use `eval-frontier capture-harbor` and the installed
`harbor` CLI for leaderboard rows, row associations, and trial metadata.

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
    review.json
    README.md
    raw/<snapshot-id>/
      manifest.json
      artifacts/
    extracted/<snapshot-id>/
      normalized.parquet
  canonical/
    evidence.parquet
    pins.json
```

`build` also checks the whole table against the pins and the captured
snapshots; see [`DATASETS.md`](../docs/DATASETS.md#current-build-checks).

`source.json`, `manifest.json`, and `crosswalk.json` are JSON metadata.
`review.json` holds the reviewed analysis decisions for the pinned snapshot,
and `README.md` describes the capture and extraction; see
[the source process](../docs/SOURCE-PIPELINE.md#record-the-decision). The raw
archive is immutable. Each `normalized.parquet` contains the canonical schema
for one source snapshot. See [`DATASETS.md`](../docs/DATASETS.md) for the row
contract and catalog details.

## Code layout

The Pydantic models live in `src/eval_frontier/schemas/`. Source archive code
lives in `src/eval_frontier/sources/`, adapters live in
`src/eval_frontier/sources/adapters/`, and checks of trial details against
published aggregates live in `src/eval_frontier/sources/reconcile.py`.
`src/eval_frontier/sources/review.py` loads each source's `review.json`,
checks it against the catalogs, and, during `build`, checks every review made
for the pinned snapshot against the evidence.
Canonicalization, table checks, and Parquet writing live in
`src/eval_frontier/evidence/`.
