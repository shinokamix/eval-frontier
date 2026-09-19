# Data pipeline

The pipeline has four stages: capture, extract, harmonize, and publish.
`pnpm data:build` writes `data/build/research.json`. The site reads
`public/data/research.json`. That file is hand-edited and is not pipeline
output.

The four stages run for `kroda-coding-agent-baselines`.
`aarora-harness-benchmarks` has a captured snapshot and no adapter.

To capture a source or add one to the build, see
[Add a source](add-a-source.md).

```text
source.json  ->  raw snapshot  ->  observations.json  ->  data/build/research.json
                 (bytes + hash)     (source labels)        (canonical studies)
```

## data/

```text
data/
  sources/<source-id>/
    source.json
    extract.ts
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
  build/
    research.json
public/data/research.json
```

`data/sources/<source-id>/` holds one publication. `source.json` and `raw/`
exist after capture. `extract.ts`, `crosswalk.json`, and `extracted/` exist
after the source joins the build. `kroda-coding-agent-baselines` has those
files. `aarora-harness-benchmarks` has `source.json` and `raw/` only.

`extract.ts` is the adapter for that source's artifacts. `crosswalk.json` maps
that source's native strings to catalog ids. Recapture writes a new snapshot id.
Extract writes `extracted/<snapshot-id>/` and does not overwrite an old one.

`data/canonical/` holds catalog ids, pins, and study definitions. It does not
hold adapters.

`canonical/pins.json` names the snapshot that extract and publish read for each
source. Capture may keep older snapshots. The build reads only the pinned
snapshot.

## scripts/data/

```text
scripts/data/
  cli.ts
  shared/
    json.ts
    schema.ts
  capture/
  extract/
  harmonize/
  publish/
```

`cli.ts` dispatches `capture`, `verify`, `extract`, and `build`. A stage imports
`shared` and earlier stages. It does not import a later stage. Adapters live in
`data/sources/<source-id>/extract.ts`.

Each stage's `index.ts` is the public entry. Tests sit next to the stage they
cover.

### shared/json.ts

Reads and writes JSON with a trailing newline. Capture, extract, and publish use
this module.

### shared/schema.ts

Zod schemas for observations, crosswalks, pins, studies, and
`data/build/research.json`. A file that fails a schema fails the build before
write. `src/module/explore/schema/research.ts` is a looser schema. The site uses
it to load `public/data/research.json`.

### capture/

`capture/capture.ts` downloads the HTTP artifacts in `source.json`. It writes
`raw/<snapshot>/` and records SHA-256 checksums in `manifest.json`. The snapshot
id is derived from artifact paths and checksums. Capture time does not affect
it. The same bytes produce the same id.

`pnpm data:verify` recomputes checksums with no network. Capture does not map
names, convert units, or compute scores.

`capture.test.ts` uses fixture HTTP responses.

### extract/

`extract/extract.ts` loads `data/sources/<source-id>/extract.ts`. It runs the
adapter on the pinned artifact and writes
`extracted/<snapshot-id>/observations.json`. It checks the artifact checksum
before parse.

The adapter exports `artifactPath` and `extract`. `artifactPath` is one file
name under `artifacts/`. `extract` receives that file as text and returns native
rows. The runner adds `provenance`. `kroda-coding-agent-baselines` reads CSV
through `csv-parse`. `aarora-harness-benchmarks` has no adapter.

`extract.test.ts` rebuilds the pinned `kroda-coding-agent-baselines` snapshot
and checks that `observations.json` has 1456 rows.

### harmonize/

`harmonize/harmonize.ts` maps native strings through `crosswalk.json`. It
selects rows from `studies.json`, aggregates metrics, and computes Pareto
fronts. It does not read `raw/`. An unknown native string throws.

`harmonize.test.ts` checks that an unmapped metric name throws.

### publish/

`publish/publish.ts` extracts every pinned source. It harmonizes every study in
`canonical/studies.json`. It writes `data/build/research.json`.

`publish.test.ts` rebuilds the pinned `kroda-coding-agent-baselines` snapshot
and checks quality, median time, and Pareto membership.
`aarora-harness-benchmarks` is not in that test.

## Capture

An artifact is the published bytes plus provenance and a SHA-256 checksum.
`source.json` may list more than one artifact.

Capture fetches HTTP or HTTPS URLs with GET. It writes the response body with no
parse and no reformat. It records the request URL, the final URL, the status,
the media type, and the checksum. It does not store cookies, authorization
headers, or API keys.

If a page loads results from a JSON endpoint, that JSON response is a separate
artifact.

Capture has no git-archive command and no manual-download command. GitHub files
are pinned with `raw.githubusercontent.com` URLs that include a commit SHA, as
in the existing `source.json` files.

### source.json

```json
{
  "schemaVersion": 1,
  "id": "example-benchmark-paper",
  "title": "Example benchmark paper",
  "canonicalUrl": "https://example.org/paper",
  "license": "CC-BY-4.0",
  "redistribution": "allowed",
  "artifacts": [
    {
      "path": "paper.pdf",
      "role": "primary",
      "url": "https://example.org/paper-v1.pdf"
    }
  ]
}
```

`id` matches the directory name. It matches `^[a-z0-9]+(?:[.-][a-z0-9]+)*$`.
`redistribution` is `allowed`, `unknown`, or `restricted`. Artifact `path`
matches `^[A-Za-z0-9][A-Za-z0-9._-]*$`. It is a file name, not a nested path.

### manifest.json

```json
{
  "schemaVersion": 1,
  "snapshotId": "...",
  "sourceId": "example-benchmark-paper",
  "title": "Example benchmark paper",
  "canonicalUrl": "https://example.org/paper",
  "capturedAt": "2026-09-17T18:00:00Z",
  "license": "CC-BY-4.0",
  "redistribution": "allowed",
  "artifacts": [
    {
      "path": "artifacts/paper.pdf",
      "role": "primary",
      "mediaType": "application/pdf",
      "sha256": "...",
      "acquisition": {
        "type": "http",
        "url": "https://example.org/paper.pdf",
        "finalUrl": "https://example.org/paper.pdf",
        "method": "GET",
        "status": 200
      }
    }
  ]
}
```

`capturedAt` is recorded and is not part of the snapshot id.

## Extract

Extract reads the pinned snapshot and writes `observations.json`. Rows keep the
source's labels, units, and missing cells. Empty cells are omitted. They are not
written as `0`.

Extract does not compute Pareto fronts, evidence grades, or catalog ids.

Each native row has `model`, `harness`, `benchmark`, `condition`, `trial`,
`scoring`, and `metrics`. Native strings are the source's own labels for those
fields.

```json
{
  "schemaVersion": 1,
  "sourceId": "kroda-coding-agent-baselines",
  "snapshotId": "72f5c501feb7da5054ceccea20376853c5a97809d42d613f348d0e8c76d247c4",
  "artifact": {
    "path": "artifacts/per_challenge_results.csv",
    "sha256": "75d3cb09bfb63d3efefcbb3552e7db3276ce6a6a76f47674b021ee2f752dd854"
  },
  "rows": [
    {
      "provenance": { "path": "artifacts/per_challenge_results.csv", "row": 2 },
      "native": {
        "model": "gpt-5",
        "harness": "codex",
        "benchmark": "XBEN-001-24",
        "condition": "baseline",
        "trial": "1",
        "scoring": "solved",
        "metrics": {
          "solved": 1,
          "duration_seconds": 100.18,
          "cost_usd": 0.153931,
          "total_tokens": 315638
        }
      }
    }
  ]
}
```

`row` is the 1-based line in the artifact, including the header. The first data
line is 2.

`kroda-coding-agent-baselines` uses `csv-parse`.

## Harmonize

Harmonize reads `observations.json` and `data/canonical/`. It does not read
`raw/`.

`models.json`, `harnesses.json`, and `metrics.json` are the allowed ids. Each
entry has `id` and `label`:

```json
{ "schemaVersion": 1, "models": [{ "id": "gpt-5", "label": "GPT-5" }] }
```

`harnesses.json` uses a `harnesses` array. `metrics.json` uses a `metrics`
array.

`canonical/pins.json` maps source id to snapshot id:

```json
{
  "schemaVersion": 1,
  "sources": {
    "kroda-coding-agent-baselines": "72f5c501feb7da5054ceccea20376853c5a97809d42d613f348d0e8c76d247c4"
  }
}
```

`data/sources/<source-id>/crosswalk.json` maps native strings onto catalog ids.
An unknown native string fails the build. There is no fuzzy match.

`kroda-coding-agent-baselines` maps `duration_seconds` to `duration_s`. Names
that already match stay as themselves.

```json
{
  "schemaVersion": 1,
  "models": { "gpt-5": "gpt-5", "gpt-5.2": "gpt-5.2", "gpt-5.5": "gpt-5.5" },
  "harnesses": { "codex": "codex", "opencode": "opencode", "pi": "pi" },
  "metrics": {
    "solved": "solved",
    "duration_seconds": "duration_s",
    "cost_usd": "cost_usd"
  }
}
```

`metrics.json` treats distinct quantities as distinct ids. Median time over all
attempts is not median time over successes. Fresh tokens are not runtime context
tokens. Harmonize does not convert one scoring system into another. It does not
translate units across studies.

`canonical/studies.json` is `{ "schemaVersion": 1, "studies": [ ... ] }`. Each
study has this shape. `select` keeps rows whose canonical model and native
condition match. `model` equals `select.model`. Two publications are not one
study.

```json
{
  "id": "xbow_gpt5",
  "title": "Baselines Before Architecture",
  "model": "gpt-5",
  "benchmark": "XBOW 104-task pentest benchmark",
  "sourceId": "kroda-coding-agent-baselines",
  "evidenceGrade": "A-",
  "configurationId": "default",
  "select": { "model": "gpt-5", "native": { "condition": "baseline" } },
  "qualityMetric": "quality",
  "resultMetrics": [
    { "id": "quality", "kind": "rate", "source": "solved" },
    { "id": "time_median_s", "kind": "median", "source": "duration_s" },
    {
      "id": "cost_per_success_usd",
      "kind": "sum_per_success",
      "source": "cost_usd"
    }
  ],
  "comparisons": [
    {
      "id": "quality_time",
      "status": "primary",
      "xMetric": "time_median_s",
      "yMetric": "quality"
    }
  ],
  "caveats": [
    "This is a historical public benchmark, so tasks may have appeared in training data."
  ]
}
```

`resultMetrics` aggregate row values into a published metric:

- `rate` is the mean of `source` across rows. For `solved` as 0 or 1, that mean
  is tasks solved.
- `median` is the median of `source`.
- `sum_per_success` is the sum of `source` divided by the number of rows with
  `solved === 1`. If there are no successes, that metric is omitted.

A result with no value for a metric is omitted from that axis and kept for other
axes. A comparison with fewer than two eligible results has status
`insufficient_data`. `primary` and `sensitivity` come from `studies.json`.

Result X dominates result Y when X has equal or higher quality and equal or
lower resource use, and at least one of those is strict. The Pareto front is
derived. It is not stored in `raw/` or `extracted/`.

The comparison rules are the methodology page at `/methodology`.

## Publish

Publish writes `data/build/research.json`. `shared/schema.ts` is the contract
for that file.

```json
{
  "schemaVersion": 1,
  "studies": [
    {
      "id": "xbow_gpt5",
      "title": "Baselines Before Architecture",
      "model": { "id": "gpt-5", "label": "GPT-5" },
      "benchmark": "XBOW 104-task pentest benchmark",
      "qualityMetric": "quality",
      "source": {
        "id": "kroda-coding-agent-baselines",
        "url": "https://github.com/krodalabs/coding-agent-research-artifact/tree/4dc9df7cc69cc85111624faf42a247b6bcffc936",
        "evidenceGrade": "A-"
      },
      "results": [
        {
          "id": "xbow_gpt5:codex:default",
          "harness": { "id": "codex", "name": "Codex" },
          "metrics": {
            "quality": 0.6730769230769231,
            "time_median_s": 165.29000000000002,
            "cost_per_success_usd": 0.3958542285714285
          },
          "sample": {
            "tasks": 104,
            "trialsPerTask": 2,
            "evaluatedCells": 208,
            "successfulAttempts": 140
          },
          "caveats": [
            "This is a historical public benchmark, so tasks may have appeared in training data."
          ]
        }
      ],
      "comparisons": [
        {
          "id": "quality_time",
          "status": "primary",
          "xMetric": "time_median_s",
          "yMetric": "quality",
          "eligibleResults": [
            "xbow_gpt5:codex:default",
            "xbow_gpt5:opencode:default",
            "xbow_gpt5:pi:default"
          ],
          "paretoFront": [
            "xbow_gpt5:codex:default",
            "xbow_gpt5:opencode:default",
            "xbow_gpt5:pi:default"
          ]
        }
      ]
    }
  ]
}
```

The `url` on `source` is `canonicalUrl` from `source.json`. Result ids are
`<study-id>:<harness-id>:<configurationId>`.

## Commands

| Command                         | Effect                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| `pnpm data:capture <source-id>` | Download artifacts into `raw/<snapshot-id>/`                        |
| `pnpm data:verify`              | Recompute checksums offline                                         |
| `pnpm data:extract <source-id>` | Write `observations.json` for the pinned snapshot                   |
| `pnpm data:build`               | Extract pinned sources, harmonize, write `data/build/research.json` |
| `pnpm data:test`                | Run capture, extract, harmonize, and publish tests                  |

`data:extract` and `data:build` read `canonical/pins.json`. After capture they
run with no network.

## Errors

HTTP status outside 200-299 prints `HTTP <status>: <url>`. A source id that
fails `^[a-z0-9]+(?:[.-][a-z0-9]+)*$` prints `Invalid source ID`. An artifact
path that fails `^[A-Za-z0-9][A-Za-z0-9._-]*$` prints `Invalid artifact path`. A
source missing from `pins.json` prints `Source is not pinned: <id>`. Artifact
bytes that do not match `manifest.json` print
`Artifact checksum mismatch: <path>`. A native string missing from
`crosswalk.json` prints `Unmapped model: <name>`, `Unmapped harness: <name>`, or
`Unmapped metric: <name>`. A study whose `model` is not `select.model` prints
`Study <id> model does not match its select`. An adapter that returns no rows
prints `Extract adapter returned no rows`. Wrong CLI usage prints:

```text
Usage: node scripts/data/cli.ts capture <source-id>|verify|extract <source-id>|build
```

## Limits

Capture fetches HTTP GET only. Extract does not infer values from charts. The
pipeline does not use dlt, Airbyte, Fivetran, Dagster, or dbt. OpenRefine output
is not an input. The build replays from snapshot bytes.
