# Eval Frontier

Eval Frontier compares coding-agent configurations across public benchmarks. A
configuration is the combination of a model, harness, and effort setting.

The project does not combine raw benchmark values from different studies.
Instead, the planned analysis turns results into rankings within each study,
connects overlapping studies within task families, and estimates relative scores
for quality, cost, time, and token use. Pareto fronts then show the
configurations that offer non-dominated quality and resource tradeoffs.

## Method

```text
raw studies -> task families -> local rankings -> PL/BT -> family scores
            -> weighted global scores -> Pareto fronts
```

The method keeps metric definitions separate, reports missing data as missing,
and preserves each observation's source and experimental settings. It also
reports coverage and uncertainty so a result backed by one study does not look
as reliable as one backed by several studies.

This cross-study method is not fully implemented. The current pipeline captures
source artifacts, extracts observations, harmonizes labels, aggregates results
within a study, and calculates within-study Pareto fronts.

Read [`METHODOLOGY.md`](METHODOLOGY.md) for the full method, its interpretation
limits, and the remaining design decisions.

## Data

The pipeline has four stages:

```text
capture -> extract -> harmonize -> build
```

It stores source snapshots with checksums and keeps provenance for extracted
observations. See [`research/README.md`](research/README.md) for the pipeline and
[`research/add-a-source.md`](research/add-a-source.md) for source intake.

The Python pipeline writes the published artifacts in `research/build/`.
`research/build/research.json` is versioned so other researchers can download
the result without rebuilding the project. Moon copies it into the web app's
public data directory before dev and production builds. Do not edit generated
files by hand.

## Development

Install the web dependencies inside `apps/web` if needed:

```bash
pnpm --dir apps/web install
```

Moon owns project orchestration. Start the app with:

```bash
moon run web:dev
```

Check a change with:

```bash
moon run web:lint
moon run web:check
moon run web:build
moon run research:check
```
