# Eval Frontier

Eval Frontier compares coding-agent systems across public benchmarks. A system
is the combination of a model, harness, and effort setting. This combination is
a candidate join key across studies. The source artifacts and a future
configuration review must establish which runs are comparable.

The target research result is a graph of relative task success against relative
reported USD cost per attempted task, with Bayesian uncertainty intervals and
a Pareto frontier to guide which systems to investigate for development. The
planned analysis uses within-study differences and accounts for variation
between studies. See the
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

Install the web dependencies once:

```bash
moon run web:install
```

Run these from the repository root:

| Command | What it does |
| --- | --- |
| `moon run dev` | Starts the web app |
| `moon run nb` | Opens the research notebooks |
| `moon run check` | Runs every check |
| `moon run fix` | Fixes formatting and lint errors in place |
| `moon run build` | Builds the web app |

`dev`, `nb`, and `build` rebuild the evidence table first. These short names
are defined in the root [`moon.yml`](moon.yml). To run one project task, use
its full name, such as `moon run research:build`.
