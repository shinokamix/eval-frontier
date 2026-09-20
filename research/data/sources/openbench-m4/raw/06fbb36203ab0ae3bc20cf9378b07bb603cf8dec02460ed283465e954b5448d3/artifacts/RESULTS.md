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

---

# M3.5: the harness tax in tokens (2026-07-02)

M3.5 re-runs the matrix with **token and turn capture** wired through every
adapter — 5 harnesses × 3 tasks × **3 trials** (45 real cells + 3 null),
`gpt-5.5-medium`, all-local, subscription-OAuth only. Correctness is not the
question here (it already saturated in M3); this measures the **cost of a
solve**. All 45 real cells passed, zero adapter errors, and every real row
carried a positive-integer token count (no parser gaps). Dataset:
[`data/m3.5-2026-07-02/`](data/m3.5-2026-07-02/).

## Headline: tokens separate the field more than time does

Correctness is still a tie (all 9/9, Wilson `[0.701, 1.000]` each). But the
**token tax spans ~8×** (pi 5.3k → codex 42.5k per solve) — wider than the ~4.7×
wall-time spread — and, crucially, **the token ranking is not the time ranking.**
`pi` wins both axes decisively: fastest *and* ~8× leaner than the heaviest.

### Efficiency table (verbatim `report.py --efficiency`)

```
harness   success  rate  wilson95        mean_s        tok/slv  turns/slv
--------  -------  ----  --------------  ------------  -------  ---------
null      0/3      0%    [0.000, 0.562]  0.00 ±0.00    -        -
codex*    9/9      100%  [0.701, 1.000]  54.90 ±15.44  42.5k    -
pi        9/9      100%  [0.701, 1.000]  17.63 ±3.54   5.3k     5.6
opencode  9/9      100%  [0.701, 1.000]  54.36 ±9.60   20.7k    8.0
cursor    9/9      100%  [0.701, 1.000]  26.32 ±7.72   14.0k    -
devin**   9/9      100%  [0.701, 1.000]  83.54 ±21.46  33.8k    18.7
```

`*` **codex** token count *includes cache-read tokens*, so its tax is inflated
and **not apples-to-apples** with the others — read it as an upper-ish bound.
`**` **devin** is now effort-pinned (see caveats). `cursor` reports no turns by
design (its JSON result exposes no turn count).

## Tokens per solve, with 95% CIs

| Harness   | tok/solve | 95% CI (tokens)     | turns/solve |
|-----------|-----------|---------------------|-------------|
| pi        | 5,350     | [4,304, 6,396]      | 5.6         |
| cursor    | 13,997    | [9,731, 18,263]     | —           |
| opencode  | 20,663    | [15,354, 25,972]    | 8.0         |
| devin\*\* | 33,759    | [23,634, 43,884]    | 18.7        |
| codex\*   | 42,503    | [31,491, 53,515]    | —           |

**What's real at n=9:** `pi` is clearly the leanest — its interval clears every
other by a wide margin. `codex` is clearly the heaviest of the fresh-vs-cache
caveat aside (its lower bound, 31.5k, sits above opencode's upper bound, 26.0k).
The middle — `cursor`/`opencode`/`devin` — overlaps pairwise and is **not cleanly
ordered** at this sample size; `codex` and `devin` also carry large token variance
(sd ≈ 16k). So the robust token story is **pi ≪ {cursor, opencode} ≲ {devin,
codex}**, not a clean 1–5 ranking.

## Token rank vs time rank — they diverge

```
TIME  (fast -> slow): pi < cursor < opencode < codex < devin
TOKEN (lean -> heavy): pi < cursor < opencode < devin < codex
```

The two axes agree on the top three (pi < cursor < opencode) but **swap at the
top**: `devin` is the slowest on the clock yet spends *fewer* tokens than
`codex`, which is only mid-pack on time. The sharpest illustration is
`opencode` vs `codex`: **near-identical wall time** (54.4 vs 54.9 s) but codex
spends **~2× the tokens** (42.5k vs 20.7k). Wall-clock and token-tax are
genuinely different efficiency axes — a harness can be quick and expensive, or
slow and comparatively lean. `pi` is the one harness that is unambiguously both
fast and cheap.

## M3.5 caveats

- **codex tokens include cache reads** — its tax is not comparable to the others;
  treat the ranking as "codex is heavy" with an asterisk, not a precise multiple.
- **devin effort now pinned.** Its wall-time roughly doubled vs M3 (43.0 → 83.5 s)
  and its token tax is high. This is **consistent with either** the newly-pinned
  reasoning effort **or** day/service-load — deliberately **not** concluded.
- **3 trials, one host, one day.** Token CIs are still wide; the middle cluster is
  unresolved. Cross-day/-machine repeats and more trials would tighten it.
- **M3 ↔ M3.5 wall-times aren't directly comparable** (different trial counts and
  run day); compare *within* M3.5.

---

# M4.5: harder tasks — frontier harnesses still saturate; efficiency separates

M4.5 swapped the three trivial M3 tasks for three **harder, partial-credit** ones
(`make-ci-green` — a 6-bug CI fix; `add-feature` — a config parser with an
`@include` directive; `misleading-error` — a traceback that points at the wrong
file), and re-ran the matrix (5 harnesses × 3 tasks × 3 trials, `--timeout 900`).

**The correctness ceiling held.** The four clean harnesses — `codex`, `pi`,
`opencode`, `cursor` — each scored **9/9, mean-score 1.0**. Correctness separation
was **not** achieved at the `gpt-5.5-medium` tier; the harder tasks were still too
easy to tell frontier harnesses apart. A calibration pilot (pi + cursor × 3 tasks
× 2 trials) **predicted this**: every pilot cell scored 1.0 — the 20–80% target
band was missed *high*. (`devin` is excluded from all M4.5 results as flaky — see
the subsection below.) So, as in M3/M3.5, the discriminating signal is efficiency.

## Efficiency on non-trivial tasks (the clean four)

These tasks are a far better efficiency probe than M3's toy tasks — `add-feature`
and `make-ci-green` are multi-file, multi-step. Per harness (n=9), mean-score 1.0
for all four:

| Harness   | mean_s (95% CI)    | tokens/solve (95% CI)   | turns/solve |
|-----------|--------------------|-------------------------|-------------|
| pi        | 45.6  [27.5, 63.6] | 17,494  [11.1k, 23.9k]  | 10.4        |
| cursor    | 48.8  [35.2, 62.5] | 21,370  [13.9k, 28.8k]  | —           |
| codex\*   | 108.4 [72.9, 143.9]| 75,778  [56.6k, 95.0k]  | 1.0         |
| opencode  | 175.2 [103.5, 247.0]| 44,472 [33.9k, 55.0k]  | 15.0        |

`*` codex tokens are a **fresh basis** here (adapter now parses `--json` usage),
so this column is **not comparable** with M3.5's codex figure. `cursor` reports no
turns by design.

**Time vs token rank diverge again:**

```
TIME  (fast -> slow): pi < cursor < codex < opencode
TOKEN (lean -> heavy): pi < cursor < opencode < codex
```

`pi` and `cursor` are the efficient pair on both axes (fastest and leanest; their
token intervals overlap, so they're not cleanly separable from each other). The
split is at the top: **`opencode` is the slowest** (175 s, and with a wide CI —
these harder tasks stretch it far beyond its 63 s M3.5 figure) **yet spends fewer
tokens than `codex`**, which is quicker on the clock but the **heaviest on tokens**
(75.8 k/solve, ~4× pi). By token CI, the robust ordering is `{pi, cursor} <
opencode < codex` — codex clearly heaviest, opencode clearly the middle. Wall-clock
and token-tax remain genuinely different efficiency axes.

## This 100% table is the frontier baseline for M4

The value of a saturated correctness table is as a **baseline**: the same three
tasks, same scoring, will be run against open models (GLM-5.2, DeepSeek, Kimi) in
M4. Those weaker models are much less likely to saturate, so the **partial-credit
scores should finally bite there** — and because the tasks are identical, the open
models' scores are directly comparable to this frontier 100%. M4.5's "failure" to
separate on correctness is the **setup** for the M4 experiment, not a dead end.

## devin — FLAKY, data unreliable, excluded from all rankings

`devin`'s block is retained in the raw dataset for honesty but is **excluded from
every M4.5 number above.** After an initial adapter regression (an invalid
effort-pinned CLI model id → 0/9 instant fails, caught by the anomaly scan and
fixed in 1ba8c80), the re-run was still not trustworthy — of 9 cells:

| # | pattern | detail |
|---|---------|--------|
| 5 | clean pass | score 1.0, real tokens/turns |
| 2 | **900 s hang** | ran to the timeout, killed; checker passed (edits done pre-hang) but tokens=None — same persistent-process pipe issue as the M3 docker hang |
| 1 | exit-1 but passed | nonzero exit, work done |
| 1 | **intermittent instant exit-1** | 0.99 s, no attempt, score 0 — the fix reduced but didn't eliminate the fast-fail |

Its token counts are also internally inconsistent by ~20× (make-ci-green 716k vs
33k on the *same* task), making its tax unusable. **A plausible contributor is
service-side instability**: devin's account model access changed mid-evening (an
`/upgrade` wall appeared between the M3.5 and M4.5 runs); this data can't
distinguish adapter flakiness from service flakiness. devin also carries the
restored unpinned-effort asterisk (its model is config-pinned, not CLI-pinned).
A daytime investigation is queued.

## What would change the picture

- **Harder still.** These tasks don't separate frontier harnesses on correctness;
  M4.5 confirms the ceiling is higher than a 6-bug fix. The next hardening pass
  needs genuinely longer-horizon or partial-by-design tasks — with the **risk of
  over-hardening** (tasks so hard everyone floors are as uninformative as tasks
  everyone solves; aim for the 20–80% band, verified by pilot).
- **Open models (M4).** The highest-value next step: the same tasks against weaker
  models, where the partial-credit scores should finally discriminate.
- **A reliable devin harness.** Fix the intermittent fast-fail, the 900 s hangs,
  and the token accounting — and settle the account/service state — before devin's
  numbers can be trusted.

---

# M4: open models — most reach frontier parity; only the smallest breaks the ceiling

M4 runs **open models** on the same three hard tasks that GPT-5.5-medium saturated
in M4.5, to see if a weaker model finally produces the partial scores the tasks
were built for. Panel: {`pi`, `opencode`} × {`glm-5.2`, `deepseek-v4-flash`,
`kimi-k2.7-code`, `glm-4.7-flash`} × 3 tasks × 3 trials = 72 cells, first-party
APIs, `--timeout 900`. (`codex` excluded — open-model wiring is architecturally
blocked; see `data/m4-2026-07-03/README.md`.)

## Headline

**3 of 4 open models reach frontier parity.** `glm-5.2`, `deepseek-v4-flash`, and
`kimi-k2.7-code` (via `pi`) each score a clean **1.00** across all three tasks —
matching GPT-5.5-medium. The ceiling the tasks couldn't crack with frontier
harnesses holds for these open models too. **Only `glm-4.7-flash`** (the free,
small model) drops below: **0.47** via `pi`, with genuine partial credit
(make-ci-green 0.69, add-feature 0.40, misleading-error 0.33). So the
partial-credit design *does* finally bite — but only for the weakest model. Open
frontier-class models are, on these coding tasks, competitive with GPT-5.5-medium.

**The efficiency thesis in one number: the entire run — 72 real agent runs across
4 open models, 2 harnesses, 3 hard tasks, 3 trials — cost ~$1.02 total.**
Frontier-comparable open-model coding for about a dollar.

## Harness × model interaction (score / mean_s / tokens / $)

Mean score over all 9 cells per combo (n=9). `$` uses combined tokens at an 80/20
in/out blend (see README).

| Model              | Harness   | score  | mean_s | mean_tok | $/combo |
|--------------------|-----------|--------|--------|----------|---------|
| glm-5.2            | pi        | 1.00   | 162    | 17.2k    | $0.31   |
| glm-5.2            | opencode  | 1.00   | 165    | 20.6k    | $0.37   |
| deepseek-v4-flash  | pi        | 1.00   | 28     | 8.1k     | $0.01   |
| deepseek-v4-flash  | opencode  | 1.00   | 41     | 17.9k    | $0.03   |
| kimi-k2.7-code     | pi        | 1.00   | 68     | 8.7k     | $0.12   |
| kimi-k2.7-code     | opencode  | 0.67 ‡ | 371    | 19.0k    | $0.18   |
| glm-4.7-flash      | pi        | 0.47   | 102    | (see †)  | $0.00   |
| glm-4.7-flash      | opencode  | 0.22 ‡ | 789    | 37.9k    | $0.00   |

`†` glm-4.7-flash token counts via `pi` are implausibly small/erratic (mean ~150)
— unreliable; it's free, so this doesn't affect cost. `‡` these two opencode
scores are **confounded by an adapter bug** (below) — read them with the caveat,
not as capability. Total matrix cost **~$1.02**.

## The two "gaps" are an opencode adapter bug, not model capability

An `opencode` adapter bug turns **8 of 72 cells** into exceptions rather than
model results — `bench/adapters/opencode.py` crashes in its `TimeoutExpired`
handler (`(e.stdout or "") + (e.stderr or "")` concatenates `bytes` with `str` →
`TypeError`) whenever opencode hits the 900 s timeout with buffered output. The 8
affected cells are **7× glm-4.7-flash:opencode + 1× kimi:opencode**. Failure
taxonomy of the 72 cells:

| class | n | meaning |
|-------|---|---------|
| clean pass (1.0) | 55 | solved |
| adapter-exception | 8 | the opencode timeout-handler bug (infra, not model) |
| clean timeout | 2 | opencode ran the model past 900 s, handled cleanly |
| partial-fail | 5 | genuine partial credit (all glm-4.7-flash:pi) |
| zero | 2 | genuine misses (glm-4.7-flash:pi, misleading-error) |

**glm-4.7-flash pi 0.47 vs opencode 0.22** is *not* a clean 2× harness gap: 7 of
the 9 opencode cells are the adapter bug (opencode runs glm-4.7-flash at **789 s**
mean vs pi's 102 s → constant 900 s timeouts → the crash). Only 2 opencode cells
ran clean. The real glm-4.7-flash signal is the **pi** column, 0.47.

**kimi:opencode** = 0.667 with the adapter-exception cell, **0.750** without it.
But kimi is fully capable — **kimi:pi = 1.00 on all three tasks**. The opencode
drop is 2–3 cells timing out because opencode runs kimi at **371 s** vs pi's 68 s
(~5× slower), crossing the 900 s wall. It is a harness-efficiency × timeout
interaction, not kimi incapability.

## Harness comparison (model-agnostic quality + tax replication)

`pi` **wins or ties every model**: tie on glm-5.2 and deepseek (both 1.00/1.00),
`pi` > `opencode` on kimi and glm-4.7-flash. The rankings don't flip per model —
there is a **model-agnostic harness-quality signal**, and its mechanism is
efficiency: `opencode` runs the open models much slower (glm-flash 789 vs 102 s;
kimi 371 vs 68 s; deepseek 41 vs 28 s), and that slowness is what pushes weak/slow
models past the timeout. This **replicates the GPT-5.5 harness tax**: `pi` is again
the faster, leaner harness (leaner tokens on deepseek 8.1k vs 17.9k and kimi 8.7k
vs 19.0k), consistent with M3.5/M4.5.

## Open-vs-frontier parity (per task, vs M4.5's all-1.00 baseline)

| Task | glm-5.2 | deepseek | kimi (pi) | glm-4.7-flash (pi) | frontier (M4.5) |
|------|---------|----------|-----------|--------------------|-----------------|
| make-ci-green    | 1.00 | 1.00 | 1.00 | 0.69 | 1.00 |
| add-feature      | 1.00 | 1.00 | 1.00 | 0.40 | 1.00 |
| misleading-error | 1.00 | 1.00 | 1.00 | 0.33 | 1.00 |

Only glm-4.7-flash separates from the frontier baseline, and it does so on every
task — the partial-credit tasks discriminate exactly where a genuinely weaker
model is involved.

## Follow-ups

- **File the opencode timeout-handler bug** (decode/`text=True` the tail) and,
  separately, investigate why opencode runs open models so much slower than pi.
- **glm-4.7-flash is the discriminating model** — it's the natural target for a
  harder-task M4.5.x calibration where partial credit matters.
- A true input/output token split would sharpen the `$` column.

---

# Task-difficulty calibration: two escalation rounds (negative result) — 2026-07-03

M4/M4.5 kept hitting the same wall: our synthetic tasks saturate frontier-parity
agents on correctness. So the task factory ran two deliberate **escalation
rounds**, each trying to author a task that would drop a frontier-parity model
below 1.0. We used a single **gate probe** — `deepseek-v4-flash` via `pi`, an open
model that reaches GPT-5.5-medium parity (M4) but is cheap enough to iterate
against. **Both rounds were swept.** This section records that as a finding: it
tells us where difficulty does *not* come from.

## What was run

| Round | Candidate | Size | Structure | Baseline | Probe score (deepseek-v4-flash · pi) | Wall (s) |
|-------|-----------|------|-----------|----------|--------------------------------------|----------|
| 1 | formula-engine | ~1–3k lines | independent bugs | — | **1.00** (2/2) | 63, 110 |
| 1 | kv-transactions | ~1–3k lines | independent bugs | — | **1.00** (2/2) | 59, 65 |
| 1 | log-report | ~1–3k lines | independent bugs | — | **1.00** (2/2) | 18, 34 |
| 2 | taskflow | 7,809 lines | 7 modules seeded with logic defects — masked reveal-chains (fix one, the next appears) + cross-module misdirection | **0.2800** (7/25 tests) | **1.00 / 1.00 / 1.00** | 78, 89, 97 |
| 2 | webcore | 7,111 lines | 10-clause feature spec, **zero visible tests**, hidden 43-test suite (19 regression + 24 feature), regression-gated scoring (`0.3·[all reg pass] + 0.7·feature-fraction`) | **0.3000** (19/19 reg, 0/24 feat) | **1.00 / 0.9708 / 1.00** (mean 0.990) | 354, 410, 495 |

- **Round 1** (three small original tasks; source scratch log
  `results/pilot-tierA-v2.jsonl`, not committed because `results/` is local-only):
  the gate probe swept **6/6 cells at 1.00**. (The same tasks *do* separate a
  weaker model — `glm-4.7-flash` scored 1.0/0.0 on formula-engine and timed out on
  kv-transactions — so the factory discriminates in the open/mid band, just not at
  the frontier.)
- **Round 2** (two structurally-hardened candidates; source scratch log
  `results/gate2-round2.jsonl`, not committed because `results/` is local-only):
  both baselines land in the target band (0.28, 0.30), confirming the scoring
  discriminates a broken start-state — yet the probe swept **taskflow 1.00×3** and
  effectively swept **webcore (mean 0.990)**, the single 0.9708 trial (one of 24
  feature tests missed once) the only sub-1.0 cell across the six Round-2 trials.
  Baselines and test counts above were re-derived by running each checker against
  its pristine workspace.

## Which hardening levers resisted (and none held)

Ranked by the resistance we actually observed — the only lever that produced *any*
degradation was spec-opacity, and only a single 0.03 dip:

**spec-opacity** (webcore's hidden suite + 10-clause spec: 5× the wall-time —
354–495 s vs taskflow's 78–97 s — and the only sub-1.0 trial) **> interdependent
reveal-chains > misdirection > bug count > codebase size.** The last is the
sharpest negative: a **sweep at 7–8k lines kills the scale hypothesis** — making
the codebase bigger did not make the task harder for the agent.

## Conclusion

**Self-contained, deterministic, fully-spec-pinned synthetic tasks do not
challenge 2026 frontier-parity agents at a feasible authoring cost.** Every lever
we can cheaply author — more bugs, more masking, more misdirection, more lines,
opaquer specs — was absorbed. Difficulty at the frontier must come from a
*different source* (genuine long-horizon state, environment/tool friction, or
under-specification that a human couldn't fully pin either), not from making a
closed, gradeable task denser. This mirrors the wider field: FrontierCode reports
**~40 expert-hours per task** — frontier difficulty is expensive to manufacture
everywhere, not just here.

## Responses (what we do about it)

- **(a) Import proven-hard tasks.** Bring in Terminal-Bench tasks (Apache-2.0) as a
  **separately-scored frontier tier** via the docker execution lane — difficulty
  we don't have to author (in progress).
- **(b) Budget tasks with designed-in partial credit.** Performance /
  complexity-budget tasks where the score is a continuous margin, not a
  pass/fail an agent can saturate (prototype approved).
- **(c) Keep the factory on the band it owns.** The factory demonstrably
  discriminates in the **open/mid capability band** (`glm-4.7-flash` = 0.474 in
  M4); it continues to own that band while (a)/(b) cover the frontier.

## Caveats

Deliberately narrow: **n=3 trials per candidate** (Round 2), **one probe model**
(`deepseek-v4-flash`), **one harness** (`pi`). A sweep by a single frontier-parity
probe is strong evidence the lever is weak, but it is not a claim about every model
or a guarantee no authorable lever exists — only that the ones we tried, at the
cost we can sustain, did not bite.
