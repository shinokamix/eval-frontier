import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")


@app.cell
def _():
    import json
    from itertools import combinations

    import marimo as mo
    import pandas as pd

    from eval_frontier.sources.details import harbor_trials

    return combinations, harbor_trials, json, mo, pd


@app.cell
def _(json, mo, pd):
    data_dir = mo.notebook_dir().parents[1] / "data"
    pins = json.loads((data_dir / "canonical" / "pins.json").read_text())["sources"]
    evidence = pd.read_parquet(data_dir / "canonical" / "evidence.parquet")

    def raw(source_id):
        return data_dir / "sources" / source_id / "raw" / pins[source_id]

    def results(source_id):
        manifest = json.loads((raw(source_id) / "manifest.json").read_text())
        path = next(a["path"] for a in manifest["artifacts"] if a["role"] == "results")
        return json.loads((raw(source_id) / path).read_text())

    def crosswalk(source_id):
        return json.loads((data_dir / "sources" / source_id / "crosswalk.json").read_text())

    mo.md(
        "# Source audit\n\n"
        "Checks pinned snapshots against `evidence.parquet`. Run "
        "`moon run research:build` first after changing a source."
    )
    return crosswalk, evidence, pins, raw, results


@app.cell
def _(evidence, pins):
    overview = evidence.groupby("source_id").agg(
        snapshot_id=("snapshot_id", "first"),
        rows=("value", "size"),
        trial_rows=("trial_id", "count"),
    )
    assert set(overview.index) == set(pins)
    assert all(overview.snapshot_id[s] == snap for s, snap in pins.items())
    overview
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## Terminal-Bench

    One row per leaderboard row: associated trials, cost coverage, and whether
    the sum of known costs matches the published total within $0.0051.
    """)
    return


@app.cell
def _(harbor_trials, pd, raw, results):
    def terminal_bench(source_id):
        rows = []
        for row in results(source_id)["rows"]:
            trials = [trial for _, _, trial in harbor_trials(raw(source_id), row)]
            costs = [t["cost_usd"] for t in trials if t["cost_usd"] is not None]
            metrics = row["metrics"]
            rows.append(
                {
                    "row_id": row["id"],
                    "model": row["metadata"]["model_display"]["label"],
                    "effort": row["metadata"]["reasoning_effort"],
                    "published_trials": metrics["n_trials"],
                    "trials": len(trials),
                    "known_costs": len(costs),
                    "known_cost_sum": sum(costs),
                    "published_cost": metrics["total_cost_usd"],
                    "trials_with_retries": sum(t["n_attempts"] > 1 for t in trials),
                    "additional_attempts": sum(t["n_attempts"] - 1 for t in trials),
                    "unscored": sum(not t["is_scored"] for t in trials),
                    "agent_versions": sorted({t["agent_version"] for t in trials} - {None}),
                    "trial_ids": [t["id"] for t in trials],
                }
            )
        table = pd.DataFrame(rows)
        table["complete_cost"] = table.known_costs == table.trials
        table["count_matches"] = table.trials == table.published_trials
        table["cost_matches"] = (table.known_cost_sum - table.published_cost).abs() <= 0.0051
        table["reconciled"] = table.complete_cost & table.count_matches & table.cost_matches
        table["no_retries"] = (table.trials_with_retries == 0) & (table.unscored == 0)
        return table

    tb = {s: terminal_bench(s) for s in ("terminal-bench-2.1", "terminal-bench-4-0")}
    return (tb,)


@app.cell
def _(mo, tb):
    def summary(table):
        return (
            f"{len(table)} rows, {table.trials.sum():,} trials, "
            f"{table.known_costs.sum():,} known costs. "
            f"Totals match: {table.cost_matches.sum()}. "
            f"Complete and reconciled: {table.reconciled.sum()}, "
            f"of which without retries: {(table.reconciled & table.no_retries).sum()}."
        )

    mo.vstack(
        [
            item
            for source_id, table in tb.items()
            for item in (
                mo.md(f"### {source_id}\n\n{summary(table)}"),
                table.drop(columns="trial_ids"),
            )
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## DeepSWE

    The adapter already reconciles scored counts, passes, and cost and duration
    means with the leaderboard. This table shows cost coverage per configuration.
    """)
    return


@app.cell
def _(json, mo, pd, raw):
    deepswe_trials = pd.DataFrame(
        json.loads((raw("deepswe-v1.1") / "artifacts" / "trials.json").read_text())["rows"]
    )
    deepswe_trials["known_cost"] = deepswe_trials.cost_usd.notna()
    deepswe = deepswe_trials.groupby("config").agg(
        model=("model", "first"),
        harness=("harness", "first"),
        effort=("reasoning_effort", "first"),
        attempts=("trial_name", "size"),
        known_costs=("known_cost", "sum"),
        excluded=("included_in_score", lambda x: (~x).sum()),
        passed=("passed", "sum"),
    )
    deepswe["complete_cost"] = deepswe.known_costs == deepswe.attempts
    missing = deepswe_trials[~deepswe_trials.known_cost]
    mo.vstack(
        [
            mo.md(
                f"{len(deepswe)} configurations, {len(deepswe_trials):,} trials, "
                f"{deepswe_trials.known_cost.sum():,} known costs. "
                f"Complete cost: {deepswe.complete_cost.sum()}. "
                f"Missing costs: {(~missing.included_in_score).sum()} excluded, "
                f"{missing.included_in_score.sum()} scored."
            ),
            deepswe,
        ]
    )
    return (deepswe,)


@app.cell
def _(mo):
    mo.md(r"""
    ## SWE-Marathon

    Cost coverage per configuration and missingness by outcome.
    """)
    return


@app.cell
def _(mo, pd, results):
    swe_trials = pd.DataFrame(
        {
            **trial,
            "task": task["task"],
            "effort": trial.get("reasoningEffort", config.get("reasoningEffort")),
        }
        for task in results("swe-marathon-v1.1").values()
        for config in task["configs"]
        for trial in config["trials"]
    )
    swe_trials["known_cost"] = swe_trials.costUsd.notna()
    swe = swe_trials.groupby(["model", "agent", "effort"], dropna=False).agg(
        attempts=("task", "size"), known_costs=("known_cost", "sum")
    )
    swe["complete_cost"] = swe.known_costs == swe.attempts
    swe_missing = swe_trials[~swe_trials.known_cost]
    mo.vstack(
        [
            mo.md(
                f"{len(swe)} configurations, {len(swe_trials):,} trials. "
                f"Complete cost: {swe.complete_cost.sum()}. "
                f"Missing costs: {len(swe_missing)}."
            ),
            swe[~swe.complete_cost],
            swe_missing.groupby(["status", "reward"]).size().rename("missing_costs"),
        ]
    )
    return (swe,)


@app.cell
def _(mo):
    mo.md(r"""
    ## Candidate links

    Systems are `(model, harness, effort)` in catalog IDs. Complete-cost systems
    come from complete, reconciled configurations without retries or unscored trials.
    """)
    return


@app.cell
def _(combinations, crosswalk, deepswe, evidence, pd, swe, tb):
    def system_set(frame):
        return {
            (m, h, None if pd.isna(e) else e)
            for m, h, e in frame[["model_id", "harness_id", "effort"]].itertuples(index=False)
        }

    systems = {s: system_set(g) for s, g in evidence.groupby("source_id")}
    cost_systems = {
        s: system_set(
            evidence[
                (evidence.source_id == s)
                & evidence.condition.isin(table.row_id[table.reconciled & table.no_retries])
            ]
        )
        for s, table in tb.items()
    }
    for source_id, table in (("deepswe-v1.1", deepswe), ("swe-marathon-v1.1", swe)):
        names = crosswalk(source_id)
        complete = table[table.complete_cost].reset_index()
        model = complete.model
        harness = complete.harness if "harness" in complete else complete.agent
        cost_systems[source_id] = {
            (names["models"][m], names["harnesses"][h], None if pd.isna(e) else e)
            for m, h, e in zip(model, harness, complete.effort, strict=True)
        }

    links = pd.DataFrame(
        {
            "sources": f"{first} / {second}",
            "shared": len(shared := systems[first] & systems[second]),
            "known_effort": sum(s[2] is not None for s in shared),
            "complete_cost_known_effort": sorted(
                (
                    s
                    for s in cost_systems.get(first, set()) & cost_systems.get(second, set())
                    if s[2] is not None
                ),
                key=str,
            ),
        }
        for first, second in combinations(sorted(systems), 2)
        if systems[first] & systems[second]
    )
    links.insert(3, "complete_cost_links", links.complete_cost_known_effort.map(len))
    links
    return


@app.cell
def _(evidence, mo, pd, tb):
    trial_ids = pd.concat(
        [
            evidence.loc[evidence.trial_id.notna(), ["source_id", "trial_id"]],
            *(
                pd.DataFrame({"source_id": s, "trial_id": t.trial_ids.explode()})
                for s, t in tb.items()
            ),
        ]
    ).drop_duplicates()
    shared_trials = trial_ids.groupby("trial_id").source_id.nunique().gt(1).sum()
    mo.md(f"Trial IDs shared across sources: {shared_trials}.")
    return


if __name__ == "__main__":
    app.run()
