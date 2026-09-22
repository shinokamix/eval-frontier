# Methodology

The statistical methodology is intentionally paused while we stabilize the
canonical evidence layer.

The current research question is narrower:

> Can we convert different public evaluation sources into one trustworthy,
> traceable `evidence.parquet` table?

The current pipeline does not fit Bayesian models, combine studies, calculate
pairwise effects, or publish decision and Pareto results. Those decisions will
be documented after the evidence table and its source coverage are stable.

The future model may use the following concepts, but they are not current
datasets:

- a system configuration is model, harness, effort, and exact run settings;
- a measurement is attached to a task or aggregate source result;
- an analysis will be a later transformation over `evidence.parquet`;
- every derived result must keep a reference to its input evidence.
