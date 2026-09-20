# Eval Frontier

Eval Frontier compares coding-agent systems across public benchmarks. A system
is the combination of a model, harness, and effort setting. This combination is
the join key across studies. Exact run settings remain attached to each result
for reproducibility.

The project does not combine raw benchmark values from different studies. The
planned analysis creates pairwise outcomes and effect sizes inside each study.
Compatibility reviews decide which studies can share a comparison network.

## Method

```text
raw studies -> compatibility review -> local comparisons
            -> weighted Bradley-Terry -> anchored family scores
            -> decision profiles -> probabilistic Pareto views
```

The method keeps metric definitions separate, reports missing data as missing,
and preserves each observation's source and run settings. Evidence grades
control which analyses use a result. Bootstrap intervals and sensitivity checks
show when sparse or fragile evidence changes a conclusion.

This cross-study method is not fully implemented. The current pipeline captures
source artifacts, extracts observations, harmonizes labels, aggregates results
within a study, and calculates within-study Pareto fronts.

Read [`METHODOLOGY.md`](docs/METHODOLOGY.md) for the reasoning behind the method.
[`SCORING.md`](docs/SCORING.md) defines the calculation.

## Data

The pipeline has four stages:

```text
capture -> extract -> harmonize -> build
```

It stores source snapshots with checksums and keeps provenance for extracted
observations. See [`research/README.md`](research/README.md) for the pipeline and
[`research/add-a-source.md`](research/add-a-source.md) for source intake.
[`DATASETS.md`](docs/DATASETS.md) defines the data contract for observations, study
results, and cross-study scores.

The Python pipeline writes the published artifacts in `research/build/`.
`research/build/research.json` is versioned so other researchers can download
the result without rebuilding the project. Moon copies it into the web app's
public data directory before dev and production builds. Do not edit generated
files by hand.

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
