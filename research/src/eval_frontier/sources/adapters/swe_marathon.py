"""Extract v1.1 trial results from the official SWE-Marathon website bundle."""

from __future__ import annotations

import json
import re
from typing import Any

_DURATION = re.compile(r"\d+[hms]")


def _seconds(value: str) -> int:
    parts = _DURATION.findall(value)
    if not parts or " ".join(parts) != value or len({part[-1] for part in parts}) != len(parts):
        raise ValueError(f"Invalid SWE-Marathon duration: {value}")
    return sum(int(part[:-1]) * {"h": 3600, "m": 60, "s": 1}[part[-1]] for part in parts)


def extract(content: str) -> list[dict[str, Any]]:
    tasks = json.loads(content)
    if len(tasks) != 20:
        raise ValueError("Unexpected SWE-Marathon v1.1 task count")

    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for task_id, task in tasks.items():
        if task["task"] != task_id:
            raise ValueError(f"SWE-Marathon task mismatch: {task_id}")
        for config in task["configs"]:
            for trial in config["trials"]:
                trial_id = trial["id"]
                if trial_id in seen:
                    raise ValueError(f"Duplicate SWE-Marathon trial: {trial_id}")
                seen.add(trial_id)
                if trial["model"] != config["model"] or trial["agent"] != config["agent"]:
                    raise ValueError(f"SWE-Marathon configuration mismatch: {trial_id}")
                if trial["reward"] not in (0, 1) or trial["tokensRaw"] < 0:
                    raise ValueError(f"Invalid SWE-Marathon result: {trial_id}")
                metrics = {
                    "reward": trial["reward"],
                    "tokensRaw": trial["tokensRaw"],
                    "duration": _seconds(trial["duration"]),
                }
                if trial["costUsd"] is not None:
                    if trial["costUsd"] < 0:
                        raise ValueError(f"Invalid SWE-Marathon cost: {trial_id}")
                    metrics["costUsd"] = trial["costUsd"]
                rows.append(
                    {
                        "_source_line": len(rows) + 1,
                        "model": trial["model"],
                        "harness": trial["agent"],
                        "benchmark": task_id,
                        "benchmark_version": "v1.1",
                        "trial": trial_id,
                        "effort": trial.get("reasoningEffort", config.get("reasoningEffort")),
                        "condition": trial["status"],
                        "metrics": metrics,
                    }
                )
    if not rows:
        raise ValueError("SWE-Marathon has no trials")
    return rows
