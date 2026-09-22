"""Extract observations from Kroda CSV results."""

from __future__ import annotations

import csv
from typing import Any


def _text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Invalid {label}")
    return value


def extract(content: str) -> list[dict[str, Any]]:
    rows = list(csv.DictReader(content.splitlines()))
    if not rows:
        raise ValueError("CSV has no data rows")
    columns = (
        "solved",
        "duration_seconds",
        "cost_usd",
        "total_tokens",
        "input_tokens",
        "cached_input_tokens",
        "output_tokens",
    )
    output = []
    for row_no, row in enumerate(rows, 2):
        metrics: dict[str, float] = {}
        for column in columns:
            value = row.get(column, "")
            if value and value.strip():
                try:
                    metrics[column] = float(value)
                except ValueError as exc:
                    raise ValueError(f"Invalid {column}") from exc
        if "solved" not in metrics:
            raise ValueError("CSV row is missing solved")
        output.append(
            {
                "_source_line": row_no,
                "model": _text(row.get("model"), "model"),
                "effort": _text(row.get("reasoning_effort"), "reasoning effort"),
                "harness": _text(row.get("agent_cli"), "harness"),
                "benchmark": _text(row.get("benchmark_id"), "benchmark"),
                "condition": _text(row.get("condition"), "condition"),
                "trial": _text(row.get("pass_index"), "trial"),
                "scoring": "solved",
                "metrics": metrics,
            }
        )
    return output
