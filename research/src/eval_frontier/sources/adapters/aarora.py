"""Extract the published /swe3 aggregate tables from Aarora's comparison."""

from __future__ import annotations

import re
from typing import Any

HEADER = (
    "Model",
    "Hosting",
    "Mean score",
    "Completed",
    "Tokens processed",
    "Run cost",
    "Cost/task",
    "Cost/point",
    "Wall-clock",
)
MILLIONS = re.compile(r"^([0-9]+(?:\.[0-9]+)?)M$")
COMPLETED = re.compile(r"^([0-9]+)/([0-9]+)$")
MINUTES = re.compile(r"^([0-9]+)m$")
DOLLARS = re.compile(r"^\$([0-9]+(?:\.[0-9]+)?)$")


def _match(pattern: re.Pattern[str], value: str, line_no: int) -> re.Match[str]:
    match = pattern.fullmatch(value)
    if match is None:
        raise ValueError(f"Invalid Aarora value on line {line_no}: {value}")
    return match


def extract(content: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    harness: str | None = None
    in_results = False
    in_table = False
    seen: set[tuple[str, str]] = set()

    for line_no, line in enumerate(content.splitlines(), 1):
        if line == "## Results by harness":
            in_results = True
            continue
        if in_results and line.startswith("## "):
            break
        if not in_results:
            continue
        if line == "### Claude Code":
            harness, in_table = "Claude Code", False
            continue
        if line == "### pi":
            harness, in_table = "pi", False
            continue
        if line.startswith("| Model |"):
            columns = tuple(part.strip() for part in line.strip("| ").split("|"))
            if columns != HEADER or harness is None:
                raise ValueError(f"Unexpected Aarora table on line {line_no}")
            in_table = True
            continue
        if not in_table or not line.startswith("|"):
            continue
        if harness is None:
            raise ValueError(f"Aarora row has no harness on line {line_no}")
        if line.startswith("|---"):
            continue
        cells = [part.strip() for part in line.strip("| ").split("|")]
        if len(cells) != len(HEADER):
            raise ValueError(f"Invalid Aarora row on line {line_no}")
        model, hosting, score, completion, tokens, cost, per_task, per_point, wall = cells
        if hosting not in {"Bedrock", "self-hosted"}:
            raise ValueError(f"Unknown Aarora hosting on line {line_no}: {hosting}")
        key = (harness, model)
        if key in seen:
            raise ValueError(f"Duplicate Aarora model and harness on line {line_no}")
        seen.add(key)
        scored, tasks = map(int, _match(COMPLETED, completion, line_no).groups())
        if tasks < 1 or scored > tasks:
            raise ValueError(f"Invalid Aarora completion on line {line_no}")
        basis = "metered" if hosting == "Bedrock" else "hardware_derived"
        rows.append(
            {
                "_source_line": line_no,
                "model": model,
                "harness": harness,
                "benchmark": "swe3",
                "aggregate": True,
                "condition": hosting,
                "sample_sizes": {
                    "mean_score_excl_failed": scored,
                    "completed_tasks": tasks,
                },
                "metrics": {
                    "mean_score_excl_failed": float(score),
                    "completed_tasks": scored,
                    "tokens_processed_millions": float(_match(MILLIONS, tokens, line_no).group(1)),
                    f"run_cost_{basis}_usd": float(_match(DOLLARS, cost, line_no).group(1)),
                    f"cost_per_task_{basis}_usd": float(
                        _match(DOLLARS, per_task, line_no).group(1)
                    ),
                    f"cost_per_point_{basis}_usd": float(
                        _match(DOLLARS, per_point, line_no).group(1)
                    ),
                    "wall_clock_minutes": int(_match(MINUTES, wall, line_no).group(1)),
                },
            }
        )
    if not rows or {row["harness"] for row in rows} != {"Claude Code", "pi"}:
        raise ValueError("Aarora results are missing a harness table")
    return rows
