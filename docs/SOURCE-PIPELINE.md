# Add or update a source

Finish with a pinned snapshot, validated evidence, and a readiness decision in
`research/data/sources/<source-id>/README.md`. Use the same process when an
existing source changes. [DATASETS.md](DATASETS.md) defines the evidence contract;
[METHODOLOGY.md](METHODOLOGY.md) defines the analysis outcomes.

## Capture or update the source

1. Inspect the published results and a similar source's adapter. Establish what
   each metric measures, its denominator, and how errors, retries, and timeouts count.
   Keep unknown denominators unknown. Record unstated results licenses as
   `not stated`; a code repository's license does not establish results terms.
2. Create or update `source.json` and `crosswalk.json`. Give exactly one artifact
   the `results` role. Map native labels to catalog IDs with the same meaning.
   Add or update the adapter in `sources/adapters/` and its registration in
   `sources/extract.py`. Every measurement needs a captured path and locator.
3. Capture the source, then put the returned snapshot ID in
   `research/data/canonical/pins.json`.

```bash
uv run --project research eval-frontier capture <source-id>
```

For DeepSWE, this command adds public trial details to the pinned results:

```bash
uv run --project research eval-frontier capture-details deepswe-v1.1
```

For either Terminal-Bench version, capture the leaderboard, every row's trial
associations, and the associated jobs' trial metadata through Harbor CLI:

```bash
uv run --project research eval-frontier capture-harbor terminal-bench-2.1
uv run --project research eval-frontier capture-harbor terminal-bench-4-0
```

The command needs a working `harbor` executable. It records the CLI version,
each command, the exact JSON bytes, and their hashes in the snapshot manifest.
It does not download trajectories or task definitions.

Trial details for existing runs update the same source. Record a new source ID
for a distinct study or results collection, and review reused runs separately.

Pin its returned ID after checking the capture. The manifest records every
requested URL and checksum. For embedded JSON, `rangeStart` and `rangeEnd` in
`source.json` request an inclusive byte range; the server must return HTTP 206.
Capture only the needed results when redistribution terms are unstated.

## Build the evidence

After changing snapshots, mappings, or extraction, run from the repository root:

```bash
moon run research:build
```

This writes the canonical and per-source Parquet tables.

## Audit the existing data

Open the [source audit notebook](../research/analysis/notebooks/source_audit.py):

```bash
moon run research:notebook
```

The task rebuilds the evidence tables first and opens marimo for `research/analysis/notebooks/`.

It reads the pinned snapshots and `evidence.parquet`, reconciles available trial
details with published aggregates, and shows cost coverage and candidate system
overlaps. It changes no files.

A mismatch reported in the audit is a finding to resolve or exclude, not a
reason to overwrite the published value.

For a new format, add numerical reconciliation checks to the adapter or the
notebook where needed. Check every configuration, not a sample. Compare row counts
before and after the build and explain changes to other sources. After code
changes, run `research:check`, `research:lint`, `research:format`,
`research:types`, and `research:deps` through Moon.

## Record the decision

Update the source's existing README with an `Analysis readiness` section:

- **Snapshot.** Link to the checked manifest.
- **Quality.** State the outcome, denominator, error handling, available
  uncertainty, and which configurations can be used.
- **Cost.** State the charges and attempt types covered, missingness, available
  spread, and which configurations can be used. A matching total does not prove
  complete coverage. Keep aggregate and trial representations of the same runs
  out of the same likelihood.
- **Comparability.** Record system versions, unknown effort, shared tasks or
  runs, and unresolved campaign overlap. Matching IDs are candidate links.
- **Next action.** Name the remaining check or missing information. Separate
  captured evidence from an online lead that has not been captured.

Use plain decisions: usable, usable subset, needs a stated check, or insufficient
information. Evaluate quality and cost separately against the methodology.
Link numerical claims to the notebook or captured artifact. Update one
row in [`source-audit.md`](../research/analysis/source-audit.md).

The audit is complete when every source has a supported decision and remaining
limits are explicit. Missing publisher data can remain a limit. Start analysis
with the supported comparisons; review both networks before choosing a reference.
