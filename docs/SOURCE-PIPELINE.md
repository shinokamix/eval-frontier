# Add a source to the research pipeline

Add a source when you have a fixed revision of its published results and know
how its measurements map to the canonical evidence table. The result is a
pinned snapshot and new rows in `research/data/canonical/evidence.parquet`.
Run the commands below from the repository root.

Use [the evidence data contract](DATASETS.md) to check the meaning of each
output field. The models in `research/src/eval_frontier/schemas/` define the
accepted metadata and row formats.

## Check the published results

Find a revision that cannot change, such as a commit hash. Check the license
and redistribution terms. Identify the results file and its model, harness,
benchmark, trial, and metric fields. Resolve any unclear metric definition or
denominator before you map it to a canonical ID.

Inspect a similar source under `research/data/sources/`. Read its
`source.json`, `crosswalk.json`, adapter, and registration in
`research/src/eval_frontier/sources/extract.py`. If its input format and
exclusions match, you can reuse the adapter.

## Capture the source files

Create `research/data/sources/<source-id>/source.json` with `schemaVersion`
set to `1`. Add a stable lowercase `id`, `title`, `canonicalUrl`, `license`,
`redistribution`, and an `artifacts` list. Give each artifact a unique relative
`path`, a `role`, and a URL fixed to the chosen revision. Assign the `results`
role to exactly one artifact. Include license, methodology, or provenance files
when they explain the results or redistribution terms.

Capture the files and verify their hashes:

```bash
uv run --project research eval-frontier capture <source-id>
uv run --project research eval-frontier verify
```

`capture` prints a snapshot ID and writes
`research/data/sources/<source-id>/raw/<snapshot-id>/manifest.json`. Check the
recorded URLs in the manifest. The `verify` command checks the captured files
against their SHA-256 hashes. Capture preserves any existing snapshot with the
same ID.

## Extract the source rows

If no adapter matches, add one under
`research/src/eval_frontier/sources/adapters/`. Register the source in
`research/src/eval_frontier/sources/extract.py`. For each result row, return
`_source_line`, the native `model` and `harness` labels, the experiment fields,
and a `metrics` map. `_source_line` identifies the row in the captured results
file. Apply source-specific exclusions and defaults in the adapter or its
registration.

Add the captured snapshot ID to `research/data/canonical/pins.json`. Then run:

```bash
uv run --project research eval-frontier extract <source-id>
```

The command reports the number of extracted rows. Check that the count is
nonzero. The extractor requires an integer `_source_line` for each row.

## Map labels and build the table

Create `research/data/sources/<source-id>/crosswalk.json` with
`schemaVersion` set to `1`. Add `models`, `harnesses`, and `metrics` maps for
every label the adapter emits. Map each label to an ID in
`research/src/eval_frontier/catalog/`. If the catalog lacks a value with the
same meaning, add a catalog entry. Keep measurements with different meanings
under separate IDs.

Check the code and build the table:

```bash
moon run research:check
moon run research:build
```

The build writes this source's rows to
`research/data/sources/<source-id>/extracted/<snapshot-id>/normalized.parquet`.
It also combines all pinned sources in
`research/data/canonical/evidence.parquet`. Inspect both files. Confirm that
the new rows have the intended model, harness, and metric IDs. Check that
`source_path` names the results artifact and `source_locator` names its row.
Review any changes to rows from existing sources.
