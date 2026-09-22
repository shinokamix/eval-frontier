# Scoring

Scoring is deferred.

The current pipeline stops at the validated canonical table described in
[`DATASETS.md`](DATASETS.md). It does not calculate scores, pairwise effects,
posterior estimates, decision utilities, or Pareto fronts.

When analysis starts, it should read `research/data/canonical/evidence.parquet`
and write a separate derived result. Analysis outputs must never be mixed into
the canonical evidence rows.
