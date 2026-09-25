"""Extract configuration aggregates from the DeepSWE v1.1 leaderboard."""

from __future__ import annotations

import json
from collections import defaultdict
from statistics import mean
from typing import Any


def extract(content: str) -> list[dict[str, Any]]:
    published = json.loads(content)
    if published.get("n_tasks_in_set") != 113:
        raise ValueError("Unexpected DeepSWE task set")
    unit = published.get("unit", "")
    if not unit.startswith("pass@1 is attempt pass rate over scored rollout attempts."):
        raise ValueError("Unexpected DeepSWE score definition")
    source_rows = published.get("rows")
    if not isinstance(source_rows, list) or not source_rows:
        raise ValueError("DeepSWE leaderboard has no rows")

    lines = content.splitlines()
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in source_rows:
        if row.get("source") != "deep-swe" or row.get("harness") != "mini-swe-agent":
            raise ValueError("Unexpected DeepSWE source or harness")
        config = row["config"]
        if config in seen:
            raise ValueError(f"Duplicate DeepSWE configuration: {config}")
        seen.add(config)
        marker = f'"config": {json.dumps(config)}'
        locations = [number for number, line in enumerate(lines, 1) if marker in line]
        if len(locations) != 1:
            raise ValueError(f"Cannot locate DeepSWE configuration: {config}")
        attempts = row["n_attempted"]
        tasks = row["n_tasks_attempted"]
        if not 0 <= row["n_passed"] <= attempts or not 0 <= row["n_tasks_passed_any"] <= tasks:
            raise ValueError(f"Invalid DeepSWE counts: {config}")
        if abs(row["pass_at_1"] - row["n_passed"] / attempts) > 1e-10:
            raise ValueError(f"Invalid DeepSWE pass@1: {config}")
        if abs(row["pass_at_4"] - row["n_tasks_passed_any"] / tasks) > 1e-10:
            raise ValueError(f"Invalid DeepSWE pass@4: {config}")
        rows.append(
            {
                "_source_line": locations[0],
                "model": row["model"],
                "harness": row["harness"],
                "benchmark": "deep-swe",
                "benchmark_version": "v1.1",
                "aggregate": True,
                "effort": row.get("reasoning_effort"),
                "config": config,
                "sample_sizes": {
                    "pass_at_1": attempts,
                    "pass_at_4": tasks,
                },
                "interval_lowers": {"pass_at_1": row["ci_lo"]},
                "interval_uppers": {"pass_at_1": row["ci_hi"]},
                "metrics": {
                    "pass_at_1": row["pass_at_1"],
                    "pass_at_4": row["pass_at_4"],
                    "mean_cost_usd": row["mean_cost_usd"],
                    "mean_duration_seconds": row["mean_duration_seconds"],
                },
            }
        )
    return rows


def extract_trials(content: str, summary: str) -> list[dict[str, Any]]:
    """Retain all attempted outcomes and reconcile scored aggregates."""
    published = json.loads(content)
    trials = published["rows"]
    if len(trials) != published["n_trials"]:
        raise ValueError("DeepSWE trial count mismatch")
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    rows = []
    seen = set()
    for index, trial in enumerate(trials, 1):
        name = trial["trial_name"]
        if name in seen or trial["source"] != "deep-swe":
            raise ValueError(f"Invalid DeepSWE trial: {name}")
        seen.add(name)
        if type(trial["passed"]) is not bool or type(trial["included_in_score"]) is not bool:
            raise ValueError(f"Invalid DeepSWE outcome: {name}")
        groups[trial["config"]].append(trial)
        metrics = {"solved": int(trial["passed"])}
        if trial["cost_usd"] is not None:
            if trial["cost_usd"] < 0:
                raise ValueError(f"Negative DeepSWE cost: {name}")
            metrics["cost_usd"] = trial["cost_usd"]
        rows.append(
            {
                "_source_line": index,
                "model": trial["model"],
                "harness": trial["harness"],
                "benchmark": trial["task_name"],
                "benchmark_version": "v1.1",
                "trial": name,
                "effort": trial.get("reasoning_effort"),
                "outcome_status": trial["outcome"],
                "scored": trial["included_in_score"],
                "failure_type": trial["error_category"],
                "metrics": metrics,
            }
        )
    aggregates = json.loads(summary)["rows"]
    if set(groups) != {row["config"] for row in aggregates}:
        raise ValueError("DeepSWE trial configurations differ from leaderboard")
    for row in aggregates:
        group = groups[row["config"]]
        scored = [trial for trial in group if trial["included_in_score"]]
        costs = [trial["cost_usd"] for trial in scored if trial["cost_usd"] is not None]
        durations = [
            trial["agent_duration_seconds"]
            for trial in scored
            if trial["agent_duration_seconds"] is not None
        ]
        if (
            len(scored) != row["n_attempted"]
            or sum(trial["passed"] for trial in scored) != row["n_passed"]
            or len({trial["task_name"] for trial in scored}) != row["n_tasks_attempted"]
            or len({trial["task_name"] for trial in scored if trial["passed"]})
            != row["n_tasks_passed_any"]
            or abs(mean(costs) - row["mean_cost_usd"]) > 1e-8
            or abs(mean(durations) - row["mean_duration_seconds"]) > 1e-8
            or any(
                (trial["model"], trial["harness"], trial.get("reasoning_effort"))
                != (row["model"], row["harness"], row.get("reasoning_effort"))
                for trial in group
            )
        ):
            raise ValueError(f"DeepSWE aggregate mismatch: {row['config']}")
    return rows
