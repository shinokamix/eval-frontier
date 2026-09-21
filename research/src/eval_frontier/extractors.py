"""Parse source snapshots into normalized native observations."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Any

from .snapshots import read_json, verify_snapshot, write_json


def text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Invalid {label}")
    return value


def openbench_extract(
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
        harness = text(item.get("harness"), "harness")
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
        model_raw = text(item.get("model"), "model")
        match = re.match(r"^(.*)-(low|medium|high|xhigh)$", model_raw)
        model, effort = (match.group(1), match.group(2)) if match else (model_raw, None)
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
                "model": model,
                "effort": None if harness in no_effort else effort,
                "harness": harness,
                "benchmark": text(item.get("task"), "task"),
                "condition": condition,
                "trial": str(item.get("trial")),
                "scoring": "success" if "score" not in item else "partial_score",
                "metrics": metrics,
            }
        )
    if not rows:
        raise ValueError("JSONL has no data rows")
    return rows


def csv_extract(content: str) -> list[dict[str, Any]]:
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
    for row in rows:
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
                "model": text(row.get("model"), "model"),
                "effort": text(row.get("reasoning_effort"), "reasoning effort"),
                "harness": text(row.get("agent_cli"), "harness"),
                "benchmark": text(row.get("benchmark_id"), "benchmark"),
                "condition": text(row.get("condition"), "condition"),
                "trial": text(row.get("pass_index"), "trial"),
                "scoring": "solved",
                "metrics": metrics,
            }
        )
    return output


EXTRACTORS = {
    "openbench-m3": lambda content: openbench_extract(content, "m3", no_effort={"devin"}),
    "openbench-m3.5": lambda content: openbench_extract(content, "m3.5"),
    "openbench-m4": lambda content: openbench_extract(content, "m4"),
    "openbench-m4.5": lambda content: openbench_extract(content, "m4.5", excluded={"devin"}),
    "kroda-coding-agent-baselines": csv_extract,
}


def extract(data_dir: Path, source_id: str, snap: str | None = None) -> Path:
    pins = read_json(data_dir / "canonical" / "pins.json")["sources"]
    snap = snap or pins.get(source_id)
    if not snap:
        raise ValueError(f"Source is not pinned: {source_id}")
    manifest = verify_snapshot(data_dir, source_id, snap)
    result = next(
        (artifact for artifact in manifest["artifacts"] if artifact["role"] == "results"),
        None,
    )
    if not result:
        raise ValueError("Snapshot has no results artifact")
    content = (data_dir / "sources" / source_id / "raw" / snap / result["path"]).read_text(
        encoding="utf-8"
    )
    try:
        extractor = EXTRACTORS[source_id]
    except KeyError as exc:
        raise ValueError(f"No extractor registered for source: {source_id}") from exc
    native = extractor(content)
    rows = [
        {"provenance": {"path": result["path"], "row": i + 2}, "native": value}
        for i, value in enumerate(native)
    ]
    output = data_dir / "sources" / source_id / "extracted" / snap / "observations.json"
    write_json(
        output,
        {
            "schemaVersion": 2,
            "sourceId": source_id,
            "snapshotId": snap,
            "artifact": {"path": result["path"], "sha256": result["sha256"]},
            "rows": rows,
        },
    )
    return output
