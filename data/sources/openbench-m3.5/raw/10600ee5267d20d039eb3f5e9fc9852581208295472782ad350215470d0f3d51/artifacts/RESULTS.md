# M3 Results — first full matrix (2026-07-02)

This is the first end-to-end run of the OpenBench matrix: 5 harnesses × 3 tasks
× 5 trials on the canonical model `gpt-5.5-medium`, plus a 15-cell `null`
negative control (90 rows total, all run locally, subscription OAuth only). It is
a **shakedown result** — proof that the harness, checkers, and statistics work on
a real spend — not a leaderboard. Read it as "the pipeline works and here is what
it found," not "harness X beats harness Y."

Dataset: [`data/m3-2026-07-02/results.jsonl`](data/m3-2026-07-02/results.jsonl)
(provenance in [`data/m3-2026-07-02/README.md`](data/m3-2026-07-02/README.md)).
Every number below was recomputed from that committed file.

## Headline finding: correctness saturates, speed separates

**On correctness, the five harnesses are statistically indistinguishable.** Every
real harness solved every task on every trial — **15/15** each — which gives all
five the *identical* Wilson 95% interval `[0.796, 1.000]`. The only thing that
separates from the field is the `null` control at `[0.000, 0.204]`, confirming the
checkers actually discriminate a solved workspace from an untouched one. With the
success axis pinned at the ceiling, **no correctness ranking of these harnesses is
supportable** — any apparent ordering would be noise. These three tasks are simply
too easy to tell frontier harnesses apart on whether they succeed.

**The signal that does separate them is efficiency (wall-clock time).** Here the
harnesses span nearly 4× — from `pi` at ~16 s to `opencode` at ~63 s per cell —
and most of those gaps are real (their mean confidence intervals don't overlap).

## Success table (verbatim `bench/report.py` output)

```
harness   fix-failing-test  build-a-cli  make-it-run  overall       wilson95        mean_s  tokens
--------  ----------------  -----------  -----------  ------------  --------------  ------  ------
null      0/5               0/5          0/5          0/15 (0%)     [0.000, 0.204]  0.00    -
codex     5/5               5/5          5/5          15/15 (100%)  [0.796, 1.000]  48.28   666034
pi        5/5               5/5          5/5          15/15 (100%)  [0.796, 1.000]  16.43   -
opencode  5/5               5/5          5/5          15/15 (100%)  [0.796, 1.000]  62.70   -
cursor    5/5               5/5          5/5          15/15 (100%)  [0.796, 1.000]  21.95   -
devin*    5/5               5/5          5/5          15/15 (100%)  [0.796, 1.000]  43.03   -
```

`*` **devin**: reasoning effort is unpinned (no selector; `medium` collapses to
`gpt-5.5` at devin's default effort), so its rows are not an effort-for-effort
comparison with the others. `tokens` is populated only for `codex` because its is
the only adapter that currently parses a usage line from CLI output.

## Timing: means with 95% confidence intervals

Per-harness wall-clock, n=15 each, `mean ± 1.96·sd/√n`:

| Harness    | Mean (s) | 95% CI (s)      | sd (s) |
|------------|----------|-----------------|--------|
| pi         | 16.4     | [14.2, 18.7]    | 4.5    |
| cursor     | 22.0     | [20.0, 23.9]    | 3.9    |
| devin*     | 43.0     | [37.2, 48.9]    | 11.5   |
| codex      | 48.3     | [36.3, 60.3]    | 23.7   |
| opencode   | 62.7     | [51.1, 74.3]    | 23.0   |

**Robust ordering (what the CIs actually support):** `pi < cursor < {devin,
codex, opencode}`. Treating a difference as real only when the mean CIs don't
overlap:

- `pi` is the fastest, and clearly so — its interval clears `cursor`'s, which in
  turn clears everything slower. `pi` being ~4× faster than `opencode` is
  unambiguous.
- Within the slow cluster, two pairs **overlap and are NOT separable at n=15**:
  `devin ≈ codex` (43.0 vs 48.3) and `codex ≈ opencode` (48.3 vs 62.7). `codex`
  and `opencode` also carry high variance (sd ≈ 23 s), which blurs their
  boundaries; do not read a `codex`-vs-`opencode` ordering from this sample.

## Methodology (recap)

Each cell copies the task workspace to a fresh temp dir, runs the harness
headlessly on `gpt-5.5-medium`, and grades the result solely by `checker.sh` exit
0 — never the harness's self-report. All 90 cells ran locally and sequentially on
a single macOS host on one day, with `OPENAI_API_KEY` unset so every harness used
its subscription OAuth credential (no API-key billing). The `null` adapter does
nothing and is the negative control. Full contract, task format, and the Wilson-
interval rationale are in the repo [`README.md`](README.md); the exact run
configuration and provenance are in
[`data/m3-2026-07-02/README.md`](data/m3-2026-07-02/README.md).

## Limitations (be honest about what this is not)

- **Easy-task ceiling.** All real harnesses hit 100%. This benchmark, as
  currently loaded, cannot rank harnesses on correctness — it only shows they all
  clear a low bar. The correctness result is a floor check, not a comparison.
- **Small n.** 15 trials per harness (5 per task). Confidence intervals are wide;
  the two overlapping timing pairs above are genuinely unresolved, not tied.
- **Single host, single day.** One macOS machine, one sitting. No cross-machine or
  cross-day variance is captured; wall-clock numbers include local network and
  service-load conditions at run time.
- **devin effort unpinned.** As noted, devin's numbers aren't effort-comparable.
- **Token accounting is partial.** Only `codex` reports usage here (666,034 tokens
  across its 15 cells); the other adapters don't yet parse a usage line, so the
  "harness tax" in tokens is uncomparable across harnesses.
- **Timing is not a controlled benchmark.** Wall-clock conflates model latency,
  harness overhead, and ret/tool loops; it's indicative, not a clean measurement.

## What would change the picture

- **Harder tasks.** Longer-horizon, multi-file, or partial-credit tasks that don't
  saturate — this is the single highest-value change; without it, correctness
  stays uninformative.
- **Token accounting for every harness.** Parse usage from all adapters so the
  "harness tax" (tokens spent per solved task) is comparable — likely a sharper
  discriminator than wall time.
- **More trials.** Raising n per cell would tighten the intervals enough to
  resolve the `devin`/`codex`/`opencode` cluster (or confirm it's a genuine tie).
- **Repeat across machines/days.** To separate harness overhead from ambient
  latency and establish run-to-run stability.
