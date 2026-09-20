# M3.5 matrix run — 2026-07-02 (the harness tax in tokens)

Committed snapshot of the M3.5 efficiency matrix: the first run with **token and
turn capture** wired through every adapter. Raw log is `results.jsonl` (one JSON
object per cell; schema in the repo root `README.md`).

## What was run

- **Matrix:** 5 harnesses × 3 tasks × **3 trials** = **45 real cells**, plus a
  **3-cell `null` control** (1 trial/task) = **48 rows total**.
- **Harnesses:** `codex`, `pi`, `opencode`, `cursor`, `devin` (+ `null`).
- **Tasks:** `fix-failing-test`, `build-a-cli`, `make-it-run`.
- **Model:** canonical `gpt-5.5-medium` for every cell.
- **Execution:** `--exec local` for all 48 cells (same all-local ruling as M3).
- **Billing:** subscription OAuth only — launched with `OPENAI_API_KEY` unset
  (`env -u OPENAI_API_KEY python3 bench/run.py …`). Zero adapter errors.
- **Machine / date:** single macOS host, sequential, 2026-07-02.

## Why 3 trials (not 5 like M3)

M3.5 measures the **harness tax** (tokens and turns per solved task), not
correctness — correctness already saturated in M3 (all harnesses 15/15). Three
trials per cell is enough to estimate per-solve token/time means with confidence
intervals while keeping the spend modest. Because the trial count and run day
differ from M3, treat M3↔M3.5 wall-time deltas as **not directly comparable**;
the clean comparison is *within* this run.

## Caveats that shape the numbers

- **devin is now effort-pinned.** In M3 devin ran unpinned (its `medium`
  collapsed to a default effort); as of this run the adapter pins
  `gpt-5-5-medium`. devin's mean wall-time roughly doubled vs M3 (43.0 → 83.5 s)
  and its token tax is high — this is **consistent with either** the effort pin
  **or** day/service-load, and is **not** concluded here.
- **codex token basis includes cache.** codex reports total tokens *including
  cache-read tokens*, so its tokens-per-solve is inflated relative to harnesses
  that count only fresh usage. codex's tax is **not apples-to-apples** with the
  others — read it as an upper-ish bound (documented in `bench/adapters/codex.py`).
- **cursor reports no turns.** cursor's JSON result exposes no per-turn count, so
  its `turns/slv` is `-` by design (tokens are reported).

## Reproduce

```
python3 bench/report.py --efficiency --results-path data/m3.5-2026-07-02/results.jsonl
```

Findings and interpretation: see the **M3.5** section of `RESULTS.md` at the repo
root.
