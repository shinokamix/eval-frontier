# M4 open-model matrix — 2026-07-03

Committed snapshot of the M4 matrix: **open models** (first-party APIs) on the
three M4.5 hard tasks, to see whether weaker-than-frontier models finally break
the correctness ceiling that GPT-5.5-medium sat at (all 1.00 in M4.5).

## What was run

- **Panel:** {`pi`, `opencode`} × {`glm-5.2`, `deepseek-v4-flash`,
  `kimi-k2.7-code`, `glm-4.7-flash` (free)} × 3 tasks × 3 trials = **72 real
  cells** + a 3-cell `null` control = 75 rows, into `results.jsonl`.
- **Excluded harnesses:** `codex` (open-model wiring is architecturally BLOCKED —
  Responses-API vs chat-completions mismatch, documented at commit 7765a69),
  `cursor`/`devin` (closed model menus / flaky).
- **Execution:** `--exec local`, `--timeout 900`, sequential, resumable. API keys
  sourced from `~/.openbench/keys.env` (ZAI / DEEPSEEK / MOONSHOT); `OPENAI_API_KEY`
  kept unset for consistency (irrelevant to these providers).
- **Providers:** Z.ai (GLM), DeepSeek, Moonshot (Kimi) first-party endpoints.

## Cost (real API spend)

Total matrix **~$1.02**. Per-model: glm-5.2 $0.68, kimi-k2.7-code $0.30,
deepseek-v4-flash $0.04, glm-4.7-flash $0 (free). **Cost method:** adapters report
*combined* tokens (no input/output split), so cost uses an assumed 80/20
input/output blend at the published rates (glm-5.2 $1.4/$4.4, deepseek $0.14/$0.28,
kimi $0.95/$4.00, glm-4.7-flash free, per M tokens). Treat $ as indicative
(a true split would sharpen it).

## Run recovery note (provenance)

The full run was executed in two segments after a mid-run interruption. The first
worker-launched background run was **externally reaped** at 43/72 (the harness
reported the background job "killed"/"stopped"; the last cells completed cleanly
with no error, no OOM/provider signature — a long-lived-background-job reap in the
execution environment, the second such tonight). No data was lost: the run is
resumable by `run_id`, so the orchestrator relaunched the remaining cells (kimi +
glm-4.7-flash blocks) and they skipped the 43 completed cells. Lesson recorded:
segment long matrices into per-model background invocations.

## Data-quality caveat: an opencode adapter bug inflates its failures

**8 of the 72 cells are adapter exceptions, not model results** — all from one
bug in `bench/adapters/opencode.py` (the `subprocess.TimeoutExpired` handler
concatenates `bytes` stdout with a `str`, raising `TypeError: can't concat str to
bytes`). It fires whenever opencode hits the 900 s timeout with buffered stdout.
The 8 affected cells are **7× glm-4.7-flash:opencode + 1× kimi:opencode**. They
are recorded with `completed=false` + a traceback in `error`, score 0, and are
**excluded from capability scores** in the analysis (tabulated separately as
infra failures). Because opencode also runs the slow open models far slower than
pi (glm-4.7-flash 789 s vs pi 102 s; kimi 371 s vs pi 68 s), those combos time out
constantly — so opencode's low open-model scores are largely a
harness-slowness → timeout → adapter-bug artifact, **not** model incapability.
Filed for the adapter owner; the fix is to decode/`text=True` the timeout tail.
**The opencode fix is being applied in parallel and postdates this dataset** — so
these 8 exception cells reflect the adapter as it was *at run time*, not the
current code.

## Reproduce

```
python3 bench/report.py --efficiency --results-path data/m4-2026-07-03/results.jsonl
```
(report.py aggregates by harness across models; the harness×model interaction
analysis is in `RESULTS.md`, computed on clean cells with the adapter-exception
cells separated.)

Findings: the **M4** section of `RESULTS.md` at the repo root.
