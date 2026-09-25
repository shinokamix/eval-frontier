import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")


@app.cell
def _():
    from dataclasses import asdict

    import altair as alt
    import marimo as mo
    import numpy as np
    import pandas as pd

    from eval_frontier.catalog import HARNESSES, METRICS, MODELS
    from eval_frontier.schemas import EvidenceRow
    from eval_frontier.sources.reconcile import harbor_rows

    return EvidenceRow, HARNESSES, METRICS, MODELS, alt, asdict, harbor_rows, mo, np, pd


@app.cell
def _(alt):
    ACCENT = "#2a78d6"
    SEQUENTIAL = "blues"

    def _theme():
        return {
            "config": {
                "view": {"stroke": None},
                "axis": {"gridOpacity": 0.3, "domain": False, "tickSize": 3, "labelLimit": 240},
                "point": {"size": 64, "filled": True, "opacity": 0.85},
            }
        }

    _ = alt.theme.register("audit", enable=True)(_theme)
    return ACCENT, SEQUENTIAL


@app.cell
def _(mo, np, pd):
    data_dir = mo.notebook_dir().parents[1] / "data"
    evidence = pd.read_parquet(data_dir / "canonical" / "evidence.parquet")
    rows = evidence.assign(
        level=np.select(
            [evidence.trial_id.notna(), evidence.task_id.notna()], ["trial", "task"], "config"
        )
    )
    CONFIG = ["source_id", "model_id", "harness_id", "effort", "campaign_id"]

    mo.md(
        "# Source audit\n\n"
        "Exploratory analysis of `evidence.parquet` and checks against the pinned "
        "snapshots. `moon run research:notebook` rebuilds the table first. Source "
        "READMEs hold the decisions and artifact links; "
        "[SOURCE-PIPELINE.md](../../../docs/SOURCE-PIPELINE.md) describes the audit "
        "and [METHODOLOGY.md](../../../docs/METHODOLOGY.md) the outcomes that "
        "readiness refers to.\n\n"
        "Terms used below: a **system** is `(model, harness, effort)`; a "
        "**configuration** is a system within one source and campaign. `level` is "
        "`trial` when a row has a `trial_id`, `task` when it has only a `task_id`, "
        "and `config` otherwise. `campaign_id` separates runs of the same system "
        "within a source, such as a leaderboard row or a task subset."
    )
    return CONFIG, data_dir, evidence, rows


@app.cell
def _(mo):
    mo.md(r"""
    ## 1. Overview
    """)
    return


@app.cell
def _(evidence, mo, rows):
    overview = rows.groupby("source_id").agg(
        rows=("value", "size"),
        trial_rows=("level", lambda x: (x == "trial").sum()),
        task_rows=("level", lambda x: (x == "task").sum()),
        config_rows=("level", lambda x: (x == "config").sum()),
        metrics=("metric_id", "nunique"),
        models=("model_id", "nunique"),
        harnesses=("harness_id", "nunique"),
        tasks=("task_id", "nunique"),
    )
    mo.vstack(
        [
            overview,
            mo.md("Example rows, one per source:"),
            evidence.groupby("source_id").sample(1, random_state=0),
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 2. Contract and provenance

    `moon run research:build` stops when the table breaks its contract: every
    row validates as `EvidenceRow`, IDs and metric metadata come from the
    catalogs, each source has exactly its pinned snapshot, no two rows share
    the row grain, and every `source_path` exists in the pinned snapshot.
    """)
    return


@app.cell
def _(HARNESSES, METRICS, MODELS, evidence, mo):
    mo.md(
        f"{len(evidence):,} rows from {evidence.source_path.nunique()} source paths. "
        f"The table uses {evidence.model_id.nunique()} of {len(MODELS)} catalog models, "
        f"{evidence.harness_id.nunique()} of {len(HARNESSES)} harnesses and "
        f"{evidence.metric_id.nunique()} of {len(METRICS)} metrics."
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 3. Missingness

    Share of null values in optional columns. Required columns are never null.
    """)
    return


@app.cell
def _(EvidenceRow, SEQUENTIAL, alt, evidence, mo):
    optional = [n for n, f in EvidenceRow.model_fields.items() if not f.is_required()]
    null_share = evidence[optional].isna().groupby(evidence.source_id).mean()
    never_filled = null_share.columns[null_share.eq(1).all()].tolist()
    heatmap = (
        alt.Chart(
            null_share.reset_index().melt("source_id", var_name="column", value_name="null_share")
        )
        .mark_rect(stroke="white", strokeWidth=2)
        .encode(
            x=alt.X("column:N", sort=optional, title=None),
            y=alt.Y("source_id:N", title=None),
            color=alt.Color(
                "null_share:Q", scale=alt.Scale(scheme=SEQUENTIAL, domain=[0, 1]), title="Null"
            ),
            tooltip=["source_id", "column", alt.Tooltip("null_share:Q", format=".1%")],
        )
        .properties(width=520, height=200)
    )
    mo.vstack(
        [
            heatmap,
            mo.md(
                f"Never filled by any source: {', '.join(f'`{c}`' for c in never_filled)}. "
                "Uncertainty fields come only from published aggregates."
            ),
        ]
    )
    return


@app.cell
def _(mo, rows):
    usual_effort = ["none", "low", "medium", "high", "xhigh", "max"]
    effort_configs = (
        rows.drop_duplicates(["source_id", "model_id", "harness_id", "effort", "campaign_id"])
        .assign(effort=rows.effort.fillna("unknown"))
        .groupby(["source_id", "effort"])
        .size()
        .unstack(fill_value=0)
    )
    odd_effort = rows[rows.effort.notna() & ~rows.effort.isin(usual_effort)][
        ["source_id", "model_id", "harness_id", "effort", "source_path", "source_locator"]
    ].drop_duplicates()
    mo.vstack(
        [
            mo.md(
                "### Effort\n\n"
                "Configurations per effort label. A system with unknown effort cannot "
                "link studies. Labels outside the usual scale need a check against the "
                "source:"
            ),
            effort_configs,
            odd_effort,
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 4. Composition

    Metrics each source reports and at which level. Aggregates and trials of
    the same runs are the same evidence: analysis uses one of them per outcome.
    """)
    return


@app.cell
def _(mo, rows):
    mo.vstack(
        [
            rows.groupby(["source_id", "level", "metric_id", "unit", "statistic"])
            .size()
            .rename("rows")
            .reset_index(),
            mo.md(
                "Source-native campaigns and outcome statuses. A campaign is a "
                "leaderboard row in Terminal-Bench and a task subset in FrontierCode. "
                "Other sources publish one run per system. `outcome_status` is the "
                "publisher's trial status, which is not always task success:"
            ),
            rows.groupby(["source_id", "level"])
            .agg(
                campaigns=("campaign_id", "nunique"),
                statuses=("outcome_status", lambda x: sorted(x.dropna().unique())),
                unscored=("scored", lambda x: x.eq(False).sum()),
            )
            .reset_index(),
        ]
    )
    return


@app.cell
def _(CONFIG, SEQUENTIAL, alt, mo, rows):
    per_model = (rows[CONFIG].drop_duplicates().groupby(["model_id", "source_id"]).size()).rename(
        "configurations"
    )
    reach = per_model.groupby("model_id").size().rename("sources")
    model_chart = (
        alt.Chart(per_model.reset_index().join(reach, on="model_id"))
        .mark_rect(stroke="white", strokeWidth=2)
        .encode(
            x=alt.X("source_id:N", title=None, axis=alt.Axis(labelAngle=-30)),
            y=alt.Y(
                "model_id:N", sort=reach.sort_values(ascending=False).index.tolist(), title=None
            ),
            color=alt.Color("configurations:Q", scale=alt.Scale(scheme=SEQUENTIAL)),
            tooltip=["model_id", "source_id", "configurations", "sources"],
        )
        .properties(width=360)
    )
    mo.vstack(
        [
            mo.md(
                "### Coverage\n\n"
                f"Configurations per model and source. {(reach > 1).sum()} of "
                f"{len(reach)} models appear in more than one source; only those can "
                "link studies."
            ),
            model_chart,
        ]
    )
    return


@app.cell
def _(CONFIG, mo, rows):
    per_config = (
        rows[rows.level == "trial"]
        .groupby(CONFIG, dropna=False)
        .agg(tasks=("task_id", "nunique"), trials=("trial_id", "nunique"))
    )
    task_coverage = per_config.groupby("source_id").agg(
        configurations=("tasks", "size"),
        min_tasks=("tasks", "min"),
        max_tasks=("tasks", "max"),
        min_trials=("trials", "min"),
        max_trials=("trials", "max"),
    )
    task_coverage["tasks"] = rows[rows.level == "trial"].groupby("source_id").task_id.nunique()
    mo.vstack(
        [
            mo.md(
                "Tasks and trials per configuration in trial-level sources. Configurations "
                "that cover fewer tasks are not comparable on raw pass rate. "
                "Terminal-Bench trials appear only through their cost rows, so trials "
                "without a cost are not counted here."
            ),
            task_coverage,
            per_config[per_config.tasks < per_config.groupby("source_id").tasks.transform("max")],
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 5. Reconciliation with publications

    Before describing values, check that trials add up to what each source
    published. The flags computed here decide which configurations have
    complete costs in the sections that follow.

    ### Terminal-Bench

    One row per leaderboard row. A total matches when the sum of known trial
    costs is within $0.0051 of the published total.
    """)
    return


@app.cell
def _(asdict, data_dir, harbor_rows, pd):
    FLAGS = ["count_matches", "cost_matches", "reconciled", "no_retries"]
    tb = {
        s: pd.DataFrame(
            {**asdict(r), **{flag: getattr(r, flag) for flag in FLAGS}}
            for r in harbor_rows(data_dir, s)
        )
        for s in ("terminal-bench-2.1", "terminal-bench-4-0")
    }
    return (tb,)


@app.cell
def _(mo, tb):
    def summary(table):
        return (
            f"{len(table)} rows, {table.trials.sum():,} trials, "
            f"{table.known_costs.sum():,} known costs. "
            f"Counts match: {table.count_matches.sum()}. "
            f"Totals match: {table.cost_matches.sum()}. "
            f"Complete and reconciled: {table.reconciled.sum()}, "
            f"of which without retries or unscored trials: "
            f"{(table.reconciled & table.no_retries).sum()}. Rows needing review:"
        )

    def needs_review(table):
        return table[~(table.reconciled & table.no_retries)].drop(columns="trial_ids")

    mo.vstack(
        [
            item
            for source_id, table in tb.items()
            for item in (mo.md(f"#### {source_id}\n\n{summary(table)}"), needs_review(table))
        ]
    )
    return


@app.cell
def _(CONFIG, rows):
    def trial_table(source_id):
        """One row per trial: outcome, publisher status, and cost when known."""
        source = rows[(rows.source_id == source_id) & (rows.level == "trial")]
        solved = source[source.metric_id == "solved"].set_index("trial_id")
        cost = source[source.metric_id == "cost_usd"].set_index("trial_id").value
        return solved[[*CONFIG, "outcome_status", "scored"]].assign(solved=solved.value, cost=cost)

    def cost_coverage(trials):
        table = trials.groupby(CONFIG, dropna=False).agg(
            attempts=("solved", "size"),
            known_costs=("cost", "count"),
            unscored=("scored", lambda x: x.eq(False).sum()),
        )
        return table.assign(complete_cost=table.known_costs == table.attempts)

    deepswe_trials = trial_table("deepswe-v1.1")
    swe_trials = trial_table("swe-marathon-v1.1")
    deepswe = cost_coverage(deepswe_trials)
    swe = cost_coverage(swe_trials)
    return deepswe, deepswe_trials, swe, swe_trials


@app.cell
def _(deepswe, deepswe_trials, mo):
    deepswe_missing = deepswe_trials[deepswe_trials.cost.isna()]
    mo.vstack(
        [
            mo.md(
                "### DeepSWE\n\n"
                "The adapter already reconciles scored counts, passes, and cost and "
                "duration means with the leaderboard. "
                f"{len(deepswe)} configurations, {len(deepswe_trials):,} trials. "
                f"Complete cost: {deepswe.complete_cost.sum()}. "
                f"Missing costs: {deepswe_missing.scored.eq(False).sum()} on excluded "
                f"attempts, {deepswe_missing.scored.eq(True).sum()} on scored attempts. "
                "Configurations with missing costs:"
            ),
            deepswe[~deepswe.complete_cost],
        ]
    )
    return


@app.cell
def _(mo, swe, swe_trials):
    swe_missing = swe_trials[swe_trials.cost.isna()]
    mo.vstack(
        [
            mo.md(
                "### SWE-Marathon\n\n"
                f"{len(swe)} configurations, {len(swe_trials):,} trials. "
                f"Complete cost: {swe.complete_cost.sum()}. "
                f"Missing costs: {len(swe_missing)}. Configurations with missing costs, "
                "then missing costs by trial status and reward:"
            ),
            swe[~swe.complete_cost],
            swe_missing.groupby(["outcome_status", "solved"]).size().rename("missing_costs"),
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 6. Distributions

    Trial-level values on a log scale: costs span several orders of magnitude.
    """)
    return


@app.cell
def _(ACCENT, alt, mo, np, pd, rows):
    trial_values = rows[(rows.level == "trial") & (rows.metric_id != "solved")]

    def log_histogram(values, bins=40):
        counts, edges = np.histogram(np.log10(values[values > 0]), bins=bins)
        return pd.DataFrame({"start": 10 ** edges[:-1], "end": 10 ** edges[1:], "trials": counts})

    histograms = pd.concat(
        log_histogram(g.value).assign(panel=f"{s} · {m}")
        for (s, m), g in trial_values.groupby(["source_id", "metric_id"])
    )
    histogram_chart = (
        alt.Chart(histograms)
        .mark_rect(color=ACCENT, stroke="white", strokeWidth=1)
        .encode(
            x=alt.X("start:Q", scale=alt.Scale(type="log"), title=None),
            x2="end:Q",
            y=alt.Y("trials:Q", title="Trials"),
            y2=alt.datum(0),
            tooltip=["panel", "start", "end", "trials"],
        )
        .properties(width=220, height=110)
        .facet(facet=alt.Facet("panel:N", title=None), columns=3)
        .resolve_scale(x="independent", y="independent")
    )
    mo.vstack(
        [
            trial_values.groupby(["source_id", "metric_id"])
            .value.describe(percentiles=[0.05, 0.5, 0.95])
            .round(2),
            histogram_chart,
        ]
    )
    return


@app.cell
def _(CONFIG, mo, rows):
    trial_costs = rows[rows.metric_id == "cost_usd"]
    cost_skew = (
        trial_costs.groupby(CONFIG, dropna=False)
        .value.agg(trials="size", median="median", mean="mean", max="max", total="sum")
        .assign(max_share=lambda t: (t["max"] / t.total).round(2))
        .nlargest(10, "max_share")
    )
    mo.vstack(
        [
            mo.md(
                "### Outliers\n\n"
                f"{(trial_costs.value == 0).sum()} trial costs are exactly zero. The ten "
                "most expensive trials; check such values against the source before "
                "they enter a cost average:"
            ),
            trial_costs.nlargest(10, "value")[
                [
                    "source_id",
                    "model_id",
                    "harness_id",
                    "effort",
                    "task_id",
                    "value",
                    "source_path",
                    "source_locator",
                ]
            ],
            mo.md(
                "Configurations where one trial carries the largest share of total "
                "known cost. A high share makes the mean fragile:"
            ),
            cost_skew,
        ]
    )
    return


@app.cell
def _(ACCENT, alt, mo, rows):
    # Excluded DeepSWE attempts are not part of the published score.
    scored = rows[(rows.metric_id == "solved") & rows.scored.ne(False)]
    task_pass = scored.groupby(["source_id", "task_id"]).value.mean().rename("pass_rate")
    difficulty = (
        alt.Chart(task_pass.reset_index())
        .mark_bar(color=ACCENT, cornerRadiusEnd=2)
        .encode(
            x=alt.X("pass_rate:Q", bin=alt.Bin(step=0.05), title="Task pass rate, all systems"),
            y=alt.Y("count():Q", title="Tasks"),
        )
        .properties(width=260, height=140)
        .facet(column=alt.Column("source_id:N", title=None))
    )
    mo.vstack(
        [
            mo.md(
                "### Outcomes\n\n"
                "Pass rate over scored trials and task difficulty. Tasks that every "
                "system passes or fails carry no information about differences between "
                "systems."
            ),
            scored.groupby("source_id")
            .value.agg(trials="size", pass_rate="mean")
            .round(3)
            .join(
                task_pass.groupby("source_id").agg(
                    never_passed=lambda x: (x == 0).sum(), always_passed=lambda x: (x == 1).sum()
                )
            ),
            difficulty,
            mo.md(
                "Failure types. Each source uses its own vocabulary, so the same "
                "failure can appear under different names:"
            ),
            rows[rows.failure_type.notna()]
            .groupby(["failure_type", "source_id"])
            .size()
            .unstack(fill_value=0),
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 7. Cost and quality

    One point per configuration, one panel per source: tasks, cost accounting,
    and denominators differ between sources. Each source contributes exactly
    one quality and one cost representation, listed below. Android Bench
    reports cost per 30-task run and has no cost axis. This is a description,
    not the target graph.

    Cost status is `complete` when every trial has a cost (and, for
    Terminal-Bench, the row reconciles without retries), `incomplete`
    otherwise, `unverified` when only an aggregate is published, and `no cost`
    when the source reports none.
    """)
    return


@app.cell
def _(CONFIG, mo, pd, rows, tb):
    QUALITY = {
        "android-bench-2.0": ("trial_success_rate_pct", 0.01),
        "deepswe-v1.1": ("scored_attempt_pass_rate", 1),
        "frontiercode-v1.1": ("trial_success_rate_pct", 0.01),
        "swe-marathon-v1.1": ("solved", 1),
        "terminal-bench-2.1": ("trial_success_rate_pct", 0.01),
        "terminal-bench-4-0": ("trial_success_rate_pct", 0.01),
    }
    COST = {
        "deepswe-v1.1": "mean_cost_per_scored_attempt_usd",
        "frontiercode-v1.1": "mean_cost_per_rollout_usd",
        "swe-marathon-v1.1": "cost_usd",
        "terminal-bench-2.1": "cost_usd",
        "terminal-bench-4-0": "cost_usd",
    }

    quality_rows = rows[rows.metric_id == rows.source_id.map(lambda s: QUALITY[s][0])]
    quality = (
        (quality_rows.value * quality_rows.source_id.map(lambda s: QUALITY[s][1]))
        .groupby([quality_rows[c] for c in CONFIG], dropna=False)
        .mean()
        .rename("quality")
    )
    cost_rows = rows[rows.metric_id == rows.source_id.map(COST)]
    cost = cost_rows.groupby(CONFIG, dropna=False).value.mean().rename("cost")

    trials = (
        rows[rows.level == "trial"]
        .groupby(CONFIG, dropna=False)
        .agg(
            attempts=("trial_id", "nunique"),
            known_costs=("metric_id", lambda m: (m == "cost_usd").sum()),
        )
    )
    tb_complete = pd.concat(
        t.set_index("campaign_id").pipe(lambda x: x.reconciled & x.no_retries) for t in tb.values()
    )
    config_summary = pd.concat([quality, cost, trials], axis=1).reset_index()
    config_summary["cost_status"] = "unverified"
    trial_sourced = config_summary.source_id.isin(["deepswe-v1.1", "swe-marathon-v1.1"])
    config_summary.loc[trial_sourced, "cost_status"] = (
        config_summary.known_costs == config_summary.attempts
    ).map({True: "complete", False: "incomplete"})
    tb_rows = config_summary.campaign_id.isin(tb_complete.index)
    config_summary.loc[tb_rows, "cost_status"] = (
        config_summary.campaign_id[tb_rows]
        .map(tb_complete)
        .map({True: "complete", False: "incomplete"})
    )
    config_summary.loc[config_summary.cost.isna(), "cost_status"] = "no cost"

    mo.vstack(
        [
            pd.DataFrame({"quality": {s: m for s, (m, _) in QUALITY.items()}, "cost": COST}).fillna(
                "—"
            ),
            config_summary.groupby("source_id").cost_status.value_counts().unstack(fill_value=0),
        ]
    )
    return (config_summary,)


@app.cell
def _(alt, config_summary, mo):
    status_colors = alt.Scale(
        domain=["complete", "incomplete", "unverified"], range=["#2a78d6", "#eb6834", "#1baf7a"]
    )
    plotted = config_summary.dropna(subset=["cost", "quality"])
    scatter = (
        alt.Chart(plotted)
        .mark_point(stroke="white", strokeWidth=1)
        .encode(
            x=alt.X("cost:Q", scale=alt.Scale(type="log"), title="Mean cost per attempt, USD"),
            y=alt.Y("quality:Q", scale=alt.Scale(domain=[0, 1]), title="Pass rate"),
            color=alt.Color("cost_status:N", scale=status_colors, title="Cost"),
            tooltip=[
                "model_id",
                "harness_id",
                "effort",
                "campaign_id",
                alt.Tooltip("cost:Q", format="$.2f"),
                alt.Tooltip("quality:Q", format=".1%"),
                "cost_status",
            ],
        )
        .properties(width=240, height=190)
        .facet(facet=alt.Facet("source_id:N", title=None), columns=3)
        .resolve_scale(x="independent")
    )
    correlation = (
        plotted.groupby("source_id")[["cost", "quality"]]
        .corr(method="spearman")
        .xs("cost", level=1)
        .quality
    )
    mo.vstack(
        [
            scatter,
            mo.md("Spearman correlation between configuration cost and pass rate:"),
            correlation.round(2)
            .rename("spearman")
            .to_frame()
            .join(plotted.groupby("source_id").size().rename("configurations")),
        ]
    )
    return


@app.cell
def _(mo, rows):
    swe_wide = rows[(rows.source_id == "swe-marathon-v1.1") & (rows.level == "trial")].pivot(
        index="trial_id", columns="metric_id", values="value"
    )
    mo.vstack(
        [
            mo.md(
                "### SWE-Marathon trials\n\n"
                "The only source with cost, tokens, duration, and outcome on the same "
                "trials. Spearman correlation among trial metrics, then medians by "
                "outcome:"
            ),
            swe_wide.corr(method="spearman").round(2),
            swe_wide.groupby("solved").median().round(2),
        ]
    )
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 8. Candidate links between sources

    Shared systems between each pair of sources. Cost links count systems
    with known effort and `complete` cost status on both sides.
    """)
    return


@app.cell
def _(config_summary, pd):
    def system_set(frame):
        # None instead of NaN, which never compares equal inside a tuple.
        effort = frame.effort.astype(object).where(frame.effort.notna(), None)
        return set(zip(frame.model_id, frame.harness_id, effort, strict=True))

    systems = {s: system_set(g) for s, g in config_summary.groupby("source_id")}
    cost_ready = config_summary[
        (config_summary.cost_status == "complete") & config_summary.effort.notna()
    ]
    cost_systems = {s: system_set(g) for s, g in cost_ready.groupby("source_id")}
    sources = sorted(systems)
    links = pd.DataFrame(
        {
            "first": first,
            "second": second,
            "shared": len(shared := systems[first] & systems[second]),
            "known_effort": sum(e is not None for *_, e in shared),
            "cost_links": sorted(cost_systems.get(first, set()) & cost_systems.get(second, set())),
        }
        for i, first in enumerate(sources)
        for second in sources[i + 1 :]
        if systems[first] & systems[second]
    )
    links.insert(4, "cost_link_count", links.cost_links.map(len))
    links
    return (links,)


@app.cell
def _(evidence, links, mo, pd, tb):
    # Sources connected through cost links, found by merging linked groups.
    groups = []
    for first, second in links[links.cost_link_count > 0][["first", "second"]].itertuples(
        index=False
    ):
        joined = {first, second}.union(*(g for g in groups if g & {first, second}))
        groups = [g for g in groups if not g & joined] + [joined]
    connected = sorted(max(groups, key=len)) if groups else []

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
    mo.md(
        f"Connected by cost links: {', '.join(connected)}. "
        f"Trial IDs shared across sources: {shared_trials}; that does not prove "
        "independent campaigns or disjoint tasks."
    )
    return (connected,)


@app.cell
def _(mo):
    mo.md(r"""
    ## 9. Readiness

    Numbers come from the sections above; judgements and next actions are
    reviewed by hand and must be updated when a source changes. Complete cost
    data still need a review of the charges included before primary
    cross-study synthesis.
    """)
    return


@app.cell
def _(deepswe, deepswe_trials, mo, rows, swe, swe_trials, tb):
    tb2, tb4 = tb["terminal-bench-2.1"], tb["terminal-bench-4-0"]
    count_gaps = ", ".join(
        f"{r.published_trials}-versus-{r.trials}" for r in tb2[~tb2.count_matches].itertuples()
    )
    android_tasks = rows[(rows.source_id == "android-bench-2.0") & (rows.level == "task")]

    def link(source_id, label):
        return f"[{label}](../../data/sources/{source_id}/README.md)"

    readiness = [
        (
            link("swe-marathon-v1.1", "SWE-Marathon"),
            f"{len(swe_trials):,} binary trial outcomes usable.",
            f"{swe.complete_cost.sum()} of {len(swe)} configurations have complete costs.",
            "Confirm accounting basis and compare task coverage and settings across studies.",
        ),
        (
            link("terminal-bench-2.1", "Terminal-Bench 2.1"),
            (
                "CLI capture matches the prior leaderboard; published accuracy and SE usable. "
                f"Count mismatches to review: {(~tb2.count_matches).sum()}."
            ),
            f"{tb2.reconciled.sum()} of {len(tb2)} rows have complete costs and matching totals.",
            (
                f"Explain {(~tb2.cost_matches).sum()} total mismatches and the {count_gaps} "
                "attempt count; confirm accounting."
            ),
        ),
        (
            link("terminal-bench-4-0", "Terminal-Bench 4.0"),
            (
                "CLI capture matches the prior leaderboard; published accuracy and intervals "
                f"available. {(~tb4.no_retries).sum()} rows need retry review."
            ),
            (
                f"{tb4.reconciled.sum()} of {len(tb4)} rows have complete costs and matching "
                f"totals; {(tb4.reconciled & tb4.no_retries).sum()} also lack retry flags."
            ),
            (
                f"Explain {(~tb4.cost_matches).sum()} total mismatches and retry handling; "
                "confirm accounting."
            ),
        ),
        (
            link("deepswe-v1.1", "DeepSWE"),
            (
                f"{len(deepswe_trials):,} attempted outcomes usable; all {len(deepswe)} scored "
                "aggregates reconcile."
            ),
            f"{deepswe.complete_cost.sum()} of {len(deepswe)} configurations have complete costs.",
            (
                "Confirm accounting for configurations without `cost_basis`; review "
                "shared-system settings."
            ),
        ),
        (
            link("android-bench-2.0", "Android Bench"),
            f"{len(android_tasks)} task counts usable, five runs each.",
            "Descriptive only; coverage and spread unknown.",
            "Obtain effort settings and full-run cost details.",
        ),
        (
            link("frontiercode-v1.1", "FrontierCode"),
            "Descriptive only; denominators unknown.",
            "Descriptive only; coverage and spread unknown.",
            (
                "Obtain actual attempt counts and trial details; resolve Main/Extended campaign "
                "overlap."
            ),
        ),
    ]
    header = ("Source", "Quality", "Cost", "Next action")
    mo.md(
        "\n".join(
            "| " + " | ".join(cells) + " |"
            for cells in (header, (":---",) * len(header), *readiness)
        )
    )
    return


@app.cell
def _(connected, links, mo):
    android = links[(links["first"] == "android-bench-2.0") | (links.second == "android-bench-2.0")]
    assert "frontiercode-v1.1" not in connected
    assert android.known_effort.sum() == 0
    mo.md(f"""
    ### Start analysis

    {", ".join(connected)} remain connected by candidate shared systems after
    restricting costs to complete, reconciled configurations with known effort
    and no unresolved retry flags. FrontierCode is not needed to connect this
    group. Android Bench shares {android.shared.sum()} system(s), none with
    known effort, and cannot establish a link. These are data-supported
    candidates, not approved modeling assumptions.

    Review the surviving systems' settings, cost accounting, and campaign
    overlap. Then choose a reference and target campaigns and calculate
    within-study comparisons. Section 8 lists the exact systems on each
    candidate cost link. Keep sources with missing information available for
    descriptive analysis while resolving their limits.
    """)
    return


if __name__ == "__main__":
    app.run()
