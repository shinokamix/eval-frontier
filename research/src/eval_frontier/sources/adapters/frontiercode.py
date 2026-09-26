"""Extract FrontierCode 1.1 aggregates from Cognition's leaderboard JSON."""

from __future__ import annotations

import json
import math
import re
from typing import Any

REQUIRED_METRICS = ("new_score", "correct", "cost", "tokens")
OPTIONAL_METRICS = ("flagged_rate", "duration_min", "tool_calls", "steps")
FRACTION_METRICS = {"new_score", "correct", "flagged_rate"}
SUBSETS = {"main": 100, "extended": 150}


def _row_lines(content: str) -> dict[tuple[str, str, str], int]:
    """Locate each nested result object in the captured, formatted JSON."""
    locations: dict[tuple[str, str, str], int] = {}
    in_revision = False
    in_data = False
    model = ""
    effort = ""
    key_line = re.compile(r'^( +)("(?:[^"\\]|\\.)+"): \{$')
    for number, line in enumerate(content.splitlines(), 1):
        if line == ' "v1_1": {':
            in_revision = True
        elif in_revision and line == '  "data": {':
            in_data = True
        elif in_data:
            match = key_line.fullmatch(line)
            if match is None:
                continue
            indent, quoted = match.groups()
            key = json.loads(quoted)
            if len(indent) == 3:
                model = key
            elif len(indent) == 4:
                effort = key
            elif len(indent) == 5:
                location = (model, effort, key)
                if location in locations:
                    raise ValueError(f"Duplicate FrontierCode result location: {location}")
                locations[location] = number
    return locations


def extract(content: str) -> list[dict[str, Any]]:
    published = json.loads(content)["v1_1"]
    if published.get("subsets") != SUBSETS:
        raise ValueError("Unexpected FrontierCode task subsets")
    models = published["models"]
    data = published["data"]
    efforts = published["efforts"]
    harnesses = published["harness"]
    if (
        not models
        or len(models) != len(set(models))
        or set(models) != set(data)
        or set(models) != set(efforts)
        or set(models) != set(harnesses)
    ):
        raise ValueError("Inconsistent FrontierCode model labels")

    locations = _row_lines(content)
    rows: list[dict[str, Any]] = []
    for model in models:
        if set(efforts[model]) != set(data[model]):
            raise ValueError(f"Inconsistent FrontierCode efforts: {model}")
        for effort in efforts[model]:
            results = data[model][effort]
            if set(results) != set(SUBSETS):
                raise ValueError(f"Inconsistent FrontierCode subsets: {model}/{effort}")
            for subset in SUBSETS:
                values = results[subset]
                if not isinstance(values, dict) or any(
                    values.get(metric) is None for metric in REQUIRED_METRICS
                ):
                    raise ValueError(f"Missing FrontierCode result: {model}/{effort}/{subset}")
                unexpected = set(values) - set(REQUIRED_METRICS) - set(OPTIONAL_METRICS) - {"ote"}
                if unexpected or values.get("ote") is not None:
                    raise ValueError(f"Unknown FrontierCode metrics: {unexpected}")
                metrics = {
                    key: values[key]
                    for key in (*REQUIRED_METRICS, *OPTIONAL_METRICS)
                    if values.get(key) is not None
                }
                for key, value in metrics.items():
                    if isinstance(value, bool) or not isinstance(value, int | float):
                        raise ValueError(f"Invalid FrontierCode metric: {key}={value}")
                    if (
                        not math.isfinite(value)
                        or value < 0
                        or (key in FRACTION_METRICS and value > 1)
                    ):
                        raise ValueError(f"Out-of-range FrontierCode metric: {key}={value}")
                metrics["trial_success_rate_pct"] = metrics.pop("correct") * 100
                if "duration_min" in metrics:
                    metrics["mean_trial_duration_s"] = metrics.pop("duration_min") * 60
                location = (model, effort, subset)
                if location not in locations:
                    raise ValueError(f"Cannot locate FrontierCode result: {location}")
                rows.append(
                    {
                        "_source_line": locations[location],
                        "model": model,
                        "harness": harnesses[model],
                        "benchmark": "frontiercode",
                        "benchmark_version": "1.1",
                        "aggregate": True,
                        "effort": None if effort == "none" else effort,
                        "run": subset,
                        "metrics": metrics,
                    }
                )
    if len(rows) != len(locations):
        raise ValueError("FrontierCode result locations do not match data")
    return rows
