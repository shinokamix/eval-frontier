# Eval Frontier

Eval Frontier compares coding-agent systems across public benchmarks. A system
is the combination of a model, harness, and effort setting. This combination is
a candidate join key across studies. The source artifacts and a future
configuration review must establish which runs are comparable.

The target research result is a Bayesian graph of quality against
`cost_per_task`, combining evidence from relevant studies. The analysis uses
within-study differences and accounts for variation between studies instead
of averaging raw benchmark values. See the
[`methodology`](docs/METHODOLOGY.md) for the graph's definitions and limits.

## Current scope

```text
source artifacts -> source extractors -> validated evidence.parquet
```

The analysis is not implemented yet. The current pipeline captures immutable
source artifacts, maps source labels to canonical IDs, validates rows with
Pydantic, and writes one Parquet table for later analysis.

Use the [`documentation index`](docs/README.md) to find the methodology,
calculation, data contract, validation rules, and implementation status.

## Data

The pipeline has three stages:

```text
capture -> extract -> canonicalize
```

It stores source snapshots with checksums and keeps provenance for extracted
observations. See [`research/README.md`](research/README.md) for the pipeline and
[`SOURCE-PIPELINE.md`](docs/SOURCE-PIPELINE.md) to add a source.
[`DATASETS.md`](docs/DATASETS.md) defines the contract for `evidence.parquet`.

The Python pipeline writes `research/data/canonical/evidence.parquet`. Do not
edit the generated table by hand.

## Development

Install Moon and Node.js with Corepack. Vite+ is a project dependency, so it
does not need a separate global installation.

Install the web dependencies if needed:

```bash
moon run web:install
```

Moon owns project orchestration. Start the app with:

```bash
moon run web:dev
```

Check a change with:

```bash
moon run web:check
moon run web:knip
moon run web:build
moon run research:check
```
