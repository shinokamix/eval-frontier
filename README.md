# Eval Frontier

Eval Frontier compares coding-agent systems across public benchmarks. A system
is the combination of a model, harness, and effort setting. This combination is
a candidate join key across studies. The source artifacts and a future
configuration review must establish which runs are comparable.

The target research result is a Bayesian graph of quality against
`cost_per_task`, combining evidence from relevant studies. The planned analysis
uses within-study differences and accounts for variation between studies
instead of averaging raw benchmark values. See the
[`methodology`](docs/METHODOLOGY.md) for the graph's definitions and limits.

## Current scope

```text
source artifacts -> source extractors -> validated evidence.parquet
```

The analysis is not implemented. The current pipeline captures immutable
source artifacts, maps source labels to canonical IDs, validates rows with
Pydantic, and writes one Parquet table for later analysis. The web app currently
receives an empty `studies` list because the research build does not produce its
expected JSON input yet.

The research pipeline writes `research/data/canonical/evidence.parquet`. See
the [documentation index](docs/README.md) for the pipeline guide, data contract,
source instructions, and planned analysis.

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

Check a web change with:

```bash
moon run web:check
moon run web:knip
moon run web:build
moon run research:check
```

`research:check` runs Python bytecode compilation. Run `moon run research:lint`,
`moon run research:format`, and `moon run research:types` for the other configured
research checks.
