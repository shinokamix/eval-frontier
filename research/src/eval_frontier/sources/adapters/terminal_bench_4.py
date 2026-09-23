"""Extract configuration aggregates from the official Terminal-Bench 4.0 leaderboard."""

from __future__ import annotations

import json
import re
from typing import Any

METRICS = (
    "accuracy",
    "pass_at_2",
    "pass_at_3",
    "pass_at_4",
    "pass_at_5",
    "total_cost_usd",
    "avg_trial_duration_sec",
    "total_tokens",
    "cached_input_tokens",
    "output_tokens",
)
TASK_COUNT = 66


def extract(content: str) -> list[dict[str, Any]]:
    published = json.loads(content)
    leaderboard = published["leaderboard"]
    if leaderboard.get("package") != "terminal-bench/terminal-bench":
        raise ValueError("Unexpected Terminal-Bench package")
    if leaderboard.get("name") != "4-0-0":
        raise ValueError("Unexpected Terminal-Bench leaderboard")
    if leaderboard.get("dataset_version_ids") != ["1922072f-a433-429a-8929-350d5e1bcf02"]:
        raise ValueError("Unexpected Terminal-Bench dataset version")
    source_rows = published.get("rows")
    if not isinstance(source_rows, list) or not source_rows:
        raise ValueError("Terminal-Bench leaderboard has no rows")

    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, row in enumerate(source_rows, 1):
        row_id = row["id"]
        if row_id in seen:
            raise ValueError(f"Duplicate Terminal-Bench row: {row_id}")
        seen.add(row_id)
        metadata = row["metadata"]
        metrics = row["metrics"]
        n_trials = metrics["n_trials"]
        if not isinstance(n_trials, int) or n_trials != TASK_COUNT * 5:
            raise ValueError(f"Invalid trial count: {row_id}")
        if not 0 <= metrics["accuracy"] <= 100:
            raise ValueError(f"Invalid accuracy: {row_id}")
        if abs(metrics["accuracy"] - 100 * metrics["successes"] / n_trials) > 0.005:
            raise ValueError(f"Inconsistent accuracy and successes: {row_id}")
        if any(not 0 <= metrics[f"pass_at_{k}"] <= 1 for k in range(2, 6)):
            raise ValueError(f"Invalid pass@k: {row_id}")
        ci_half_width = metrics["accuracy_ci95_half_width"]
        if not 0 <= ci_half_width <= 100:
            raise ValueError(f"Invalid accuracy interval: {row_id}")
        sample_sizes = {"accuracy": n_trials}
        sample_sizes.update({f"pass_at_{k}": TASK_COUNT for k in range(2, 6)})
        display_cost = metrics["display_total_cost_usd"]
        if "partial:" in display_cost:
            partial = re.search(r"\(partial: (\d+)/(\d+) trials\)", display_cost)
            if (
                partial is None
                or int(partial[2]) != n_trials
                or not 0 < int(partial[1]) <= n_trials
            ):
                raise ValueError(f"Invalid partial cost coverage: {row_id}")
            sample_sizes["total_cost_usd"] = int(partial[1])
        rows.append(
            {
                "_source_line": index,
                "model": metadata["model_display"]["label"],
                "harness": metadata["agent_display"]["label"],
                "benchmark": "terminal-bench",
                "benchmark_version": "4.0.0",
                "aggregate": True,
                "effort": metadata["reasoning_effort"],
                "condition": row_id,
                "sample_sizes": sample_sizes,
                "interval_lowers": {"accuracy": round(metrics["accuracy"] - ci_half_width, 10)},
                "interval_uppers": {"accuracy": round(metrics["accuracy"] + ci_half_width, 10)},
                "metrics": {metric: metrics[metric] for metric in METRICS},
            }
        )
    return rows
