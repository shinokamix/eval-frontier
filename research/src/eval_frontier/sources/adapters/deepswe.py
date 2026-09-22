"""Extract configuration aggregates from the DeepSWE v1.1 leaderboard."""

from __future__ import annotations

import json
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
                "condition": config,
                "sample_sizes": {
                    "pass_at_1": attempts,
                    "pass_at_4": tasks,
                    "mean_cost_usd": attempts,
                    "mean_duration_seconds": attempts,
                },
                "metrics": {
                    "pass_at_1": row["pass_at_1"],
                    "pass_at_4": row["pass_at_4"],
                    "mean_cost_usd": row["mean_cost_usd"],
                    "mean_duration_seconds": row["mean_duration_seconds"],
                },
            }
        )
    return rows
