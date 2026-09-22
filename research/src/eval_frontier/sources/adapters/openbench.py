"""Extract observations from OpenBench JSONL results."""

from __future__ import annotations

import json
import re
from typing import Any


def _text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Invalid {label}")
    return value


def extract(
    content: str,
    condition: str,
    excluded: set[str] | None = None,
    no_effort: set[str] | None = None,
) -> list[dict[str, Any]]:
    excluded = {"null", *(excluded or set())}
    no_effort = no_effort or set()
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(content.splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON on line {line_no}") from exc
        harness = _text(item.get("harness"), "harness")
        if harness in excluded:
            continue
        if not isinstance(item.get("success"), bool):
            raise ValueError(f"Invalid success on line {line_no}")
        score = item.get("score", 1 if item["success"] else 0)
        if not isinstance(score, (int, float)) or isinstance(score, bool):
            raise ValueError("Invalid score")
        wall = item.get("wall_time_s")
        if not isinstance(wall, (int, float)) or isinstance(wall, bool):
            raise ValueError("Invalid wall time")
        model_raw = _text(item.get("model"), "model")
        match = re.match(r"^(.*)-(low|medium|high|xhigh)$", model_raw)
        model, effort = (match.group(1), match.group(2)) if match else (model_raw, None)
        trial_raw = item.get("trial")
        trial = str(trial_raw) if trial_raw is not None else None
        metrics: dict[str, float] = {
            "solved": int(item["success"]),
            "score": score,
            "wall_time_s": wall,
        }
        if item.get("tokens") is not None:
            if not isinstance(item["tokens"], (int, float)) or isinstance(item["tokens"], bool):
                raise ValueError("Invalid tokens")
            metrics["tokens"] = item["tokens"]
        rows.append(
            {
                "_source_line": line_no,
                "model": model,
                "effort": None if harness in no_effort else effort,
                "harness": harness,
                "benchmark": _text(item.get("task"), "task"),
                "condition": condition,
                "trial": trial,
                "scoring": "success" if "score" not in item else "partial_score",
                "metrics": metrics,
            }
        )
    if not rows:
        raise ValueError("JSONL has no data rows")
    return rows
