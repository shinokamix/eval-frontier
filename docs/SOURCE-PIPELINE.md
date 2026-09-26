# Add or update a source

Finish with a pinned snapshot, validated evidence, a README that describes the
capture and extraction, and reviewed decisions in
`research/data/sources/<source-id>/review.json`. Use the same process when an
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

This writes the canonical and per-source Parquet tables. It then checks every
`review.json` made for the pinned snapshot against the catalogs and the new
evidence. It stops when a review names a quality metric that is not task
success or a cost metric that is not USD, names a metric the source lacks at
that level, decides on unscored attempts the source does not mark or leaves
undecided ones it does, or excludes evidence that does not exist. It lists pinned sources that have no review for their snapshot yet; the
notebook leaves them out wherever decisions apply.

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

For a new format, add numerical reconciliation checks to the adapter, or to
`sources/reconcile.py` when they compare trial details with published
aggregates, and show the result in the notebook. Check every configuration, not a sample. Compare row counts
before and after the build and explain changes to other sources. After code
changes, run `research:check`, `research:lint`, `research:format`,
`research:types`, and `research:deps` through Moon.

## Record the decision

The source README describes how the snapshot was captured, what the adapter
extracts, what each locator means, and the results terms. It holds no
analysis judgements; those go in `review.json`, which the analysis reads. `SourceReview` in
`research/src/eval_frontier/schemas/review.py` defines the file:

- **`snapshotId`.** The pinned snapshot the review covers. A review for any
  other snapshot is not applied until the source is reviewed again.
- **`unscoredAttempts`.** Required when the source marks attempts it leaves
  out of its score: they count as failures or are excluded. The choice applies
  to both outcomes, so quality and cost use the same attempts. Exclude them
  only when every such attempt is shown not to be the system's own, for
  example because it failed before the agent acted; otherwise count them as
  failures. Name the other choice as a sensitivity analysis.
- **`quality` and `cost`.** A status for each outcome, evaluated separately
  against the methodology: `usable`, `usable_subset`, `descriptive`, or
  `insufficient`. Name the one metric and level that represent the outcome,
  including a descriptive one; only `insufficient` has none. Aggregate and
  trial representations of the same runs never enter the same likelihood. For
  cost, state the publisher's accounting basis, whether it is confirmed, and
  for a usable subset the admission rules a configuration must pass:
  `complete_coverage`, `matching_total`, or `no_retries`. A matching total
  does not prove complete coverage.
- **`campaigns`.** What one `campaign_id` means and whether campaigns overlap
  with each other or with other captured sources. Matching IDs are candidate
  links, not evidence of independence.
- **`exclusions`.** Campaigns or systems kept out of an outcome whose status is
  `usable_subset`, each with its reason. A usable quality subset needs at
  least one. Omitted fields match any value.
- **`nextActions`.** The remaining checks or missing information. Separate
  captured evidence from an online lead that has not been captured.

Put short reasons in `notes`. Do not copy counts the notebook reproduces; cite
a number only when it is the reason for a decision. Check the result in the
readiness section of
[`source_audit.py`](../research/analysis/notebooks/source_audit.py).

The audit is complete when every source has a supported decision and remaining
limits are explicit. Missing publisher data can remain a limit. Start analysis
with the supported comparisons; review both networks before choosing a reference.
