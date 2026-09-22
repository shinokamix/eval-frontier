"""Extract configuration aggregates from the official Terminal-Bench 2.1 leaderboard."""

from __future__ import annotations

import json
from typing import Any

METRICS = (
    "accuracy",
    "reward_hacks",
    "pass_at_2",
    "pass_at_3",
    "pass_at_4",
    "pass_at_5",
    "total_cost_usd",
    "avg_trial_duration_sec",
    "uncached_input_tokens",
    "cached_input_tokens",
    "output_tokens",
)
TASK_COUNT = 89


def extract(content: str) -> list[dict[str, Any]]:
    published = json.loads(content)
    leaderboard = published["leaderboard"]
    if leaderboard.get("package") != "terminal-bench/terminal-bench-2-1":
        raise ValueError("Unexpected Terminal-Bench package")
    if leaderboard.get("name") != "main":
        raise ValueError("Unexpected Terminal-Bench leaderboard")
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
        if not isinstance(n_trials, int) or n_trials < 1:
            raise ValueError(f"Invalid trial count: {row_id}")
        if not 0 <= metrics["accuracy"] <= 100:
            raise ValueError(f"Invalid accuracy: {row_id}")
        if not 0 <= metrics["reward_hacks"] <= 100:
            raise ValueError(f"Invalid reward hack rate: {row_id}")
        if any(not 0 <= metrics[f"pass_at_{k}"] <= 1 for k in range(2, 6)):
            raise ValueError(f"Invalid pass@k: {row_id}")
        sample_sizes: dict[str, int | None] = dict.fromkeys(METRICS, n_trials)
        sample_sizes.update({f"pass_at_{k}": TASK_COUNT for k in range(2, 6)})
        sample_sizes["avg_trial_duration_sec"] = None
        rows.append(
            {
                "_source_line": index,
                "model": metadata["model_display"]["label"],
                "harness": metadata["agent_display"]["label"],
                "benchmark": "terminal-bench",
                "benchmark_version": "2.1",
                "aggregate": True,
                "effort": metadata["reasoning_effort"],
                "condition": row_id,
                "sample_sizes": sample_sizes,
                "standard_errors": {"accuracy": metrics["accuracy_stderr"]},
                "metrics": {metric: metrics[metric] for metric in METRICS},
            }
        )
    return rows
