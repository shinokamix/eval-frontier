# Eval Frontier

Eval Frontier compares coding-agent systems across public benchmarks. A system
is the combination of a model, harness, and effort setting. This combination is
the join key across studies. Exact run settings remain attached to each result
for reproducibility.

The project does not combine raw benchmark values from different studies.
Study-specific baselines preserve benchmark difficulty. Compatibility reviews
decide which studies can share an evidence network.

## Method

```text
raw studies -> compatibility review -> Bayesian evidence networks
            -> posterior pairwise effects -> decision profiles
            -> probabilistic Pareto views
```

The method keeps metric definitions separate, reports missing data as missing,
and preserves each observation's source and run settings. Evidence grades
control which analyses use a result. Random effects, posterior intervals,
network diagnostics, and sensitivity checks show when sparse or heterogeneous
evidence changes a conclusion.

This cross-study method is not fully implemented. The current pipeline captures
source artifacts, extracts observations, harmonizes labels, aggregates results
within a study, and calculates within-study Pareto fronts.

Use the [`documentation index`](docs/README.md) to find the methodology,
calculation, data contract, validation rules, and implementation status.

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
