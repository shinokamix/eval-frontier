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
capture -> extract -> harmonize -> publish
```

It stores source snapshots with checksums and keeps provenance for extracted
observations. See [`data/README.md`](data/README.md) for the pipeline and
[`data/add-a-source.md`](data/add-a-source.md) for source intake.

The pipeline writes `data/build/research.json`. The site currently reads the
separately maintained `public/data/research.json`.

## Development

Install Vite+ if the `vp` command is unavailable:

```bash
curl -fsSL https://vite.plus | bash
```

Then install dependencies and start the app:

```bash
vp install
vp dev
```

Check a change with:

```bash
vp check
vp build
pnpm data:test
```
