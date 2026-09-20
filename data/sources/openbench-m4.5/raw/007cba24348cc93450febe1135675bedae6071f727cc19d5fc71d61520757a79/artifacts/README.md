# M4.5 matrix run — harder tasks (run 2026-07-02 eve → 2026-07-03)

Committed snapshot of the M4.5 matrix: the three **harder, partial-credit** tasks
(`make-ci-green`, `add-feature`, `misleading-error`, v1 as committed at 74c964e)
run against all five harnesses. `results.jsonl` is the raw log (48 rows). Run
window: 2026-07-02 ~22:00 → 2026-07-03 ~00:30 local, single macOS host.

## What was run

- **Matrix:** 5 harnesses × 3 tasks × **3 trials** = 45 real cells + a 3-cell
  `null` control = 48 rows.
- **Model:** canonical `gpt-5.5-medium`, `--exec local`, subscription-OAuth only
  (`env -u OPENAI_API_KEY`), `--timeout 900` (hard tasks need headroom).
- **Partial credit:** these tasks emit `SCORE:` lines; the `null` control records
  the calibration baselines (make-ci-green 0.3125, add-feature 0.400,
  misleading-error 0.000), confirming the scoring is sound.

## Headline: the four clean harnesses (the M4.5 result)

`codex`, `pi`, `opencode`, `cursor` all scored **9/9, mean-score 1.0** — the
harder tasks **still saturate** frontier harnesses on correctness. A calibration
pilot (pi + cursor × 3 tasks × 2 trials) predicted this: every pilot cell scored
1.0, i.e. the 20–80% target band was **missed high**. So M4.5 is an *efficiency*
result, not a correctness-separation result. All rankings/CIs in `RESULTS.md` are
computed on these four harnesses only.

## devin is EXCLUDED from all rankings (flaky — data unreliable)

devin's block is in the raw log but must **not** be read as a clean result:

- **Regression + recovery:** the devin adapter first regressed on an invalid
  effort-pinned CLI model id (`gpt-5-5-medium` → "Unknown model"), producing 0/9
  instant exit-1 fails. Caught by the anomaly scan; fixed in **1ba8c80** (run the
  account-default model, no `--model`); the block was purged (originals archived
  to `results/m45.devin-invalid.bak.jsonl`) and re-run.
- **The re-run was still flaky:** of 9 cells — 5 clean passes, **2× 900s hangs**
  (the persistent-process holds the pipe open past task completion — same class as
  the M3 docker hang; checker passed because edits were done, but tokens=None),
  1 exit-1-that-passed, and 1 **intermittent instant exit-1** (0.99s, no attempt).
  So the fix reduced but did not eliminate the fast-fail.
- **Token counts are internally inconsistent (~20×):** make-ci-green trial1 =
  716,017 tokens vs trial3 = 33,522 on the *same* task; misleading-error 185k vs
  18k across trials. Unusable as a tax metric.
- **Effort caveat restored:** devin exposes no CLI reasoning-effort selector; its
  model/effort is **config-pinned, not CLI-pinned** — `~/.config/devin/config.json`
  `agent.model=gpt-5-5-medium`, verified 2026-07-02 ~23:55 local. Its rows carry
  the unpinned-effort asterisk.
- **Service-side instability is a credible contributor:** devin's account model
  access changed mid-evening (an `/upgrade` wall appeared between the M3.5 run and
  this one). We **cannot** distinguish adapter flakiness from service flakiness
  from this data. A daytime investigation is queued (needs the account owner).

## Caveats for the clean four

- **codex tokens are now a FRESH basis** (adapter change 46b791e: `--json` usage),
  so codex's token column is **not comparable** with M3.5's codex column (which
  included cache reads).
- **M3.5 ↔ M4.5 wall-times aren't directly comparable** (different tasks, trial
  counts, run window).

## Future appendix (not M4)

devin's CLI menu hosts some open models directly (e.g. `glm-5.2`, `kimi-k2.7` via
devin's own serving) — a possible future appendix row for the open-model
comparisons, separate from M4's first-party API panel.

## Reproduce

```
python3 bench/report.py --efficiency --results-path data/m4.5-2026-07-03/results.jsonl
```
(The `report.py` efficiency table includes devin's flaky row; for the M4.5 result
read the four clean harnesses only, per `RESULTS.md`.)
