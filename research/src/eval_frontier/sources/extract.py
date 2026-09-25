"""Run a source adapter and return source-native rows with provenance."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from ..schemas.sources import SourcePins
from .adapters import (
    android_bench_2,
    deepswe,
    frontiercode,
    swe_marathon,
    terminal_bench,
    terminal_bench_4,
)
from .archive import read_json, verify_snapshot
from .details import harbor_trials

EXTRACTORS = {
    "android-bench-2.0": android_bench_2.extract,
    "deepswe-v1.1": deepswe.extract,
    "frontiercode-v1.1": frontiercode.extract,
    "terminal-bench-2.1": terminal_bench.extract,
    "terminal-bench-4-0": terminal_bench_4.extract,
    "swe-marathon-v1.1": swe_marathon.extract,
}


def extract(data_dir: Path, source_id: str, snapshot_id: str | None = None) -> list[dict]:
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    snapshot_id = snapshot_id or pins.get(source_id)
    if not snapshot_id:
        raise ValueError(f"Source is not pinned: {source_id}")
    manifest = verify_snapshot(data_dir, source_id, snapshot_id)
    result = next(
        (artifact for artifact in manifest["artifacts"] if artifact["role"] == "results"),
        None,
    )
    if not result:
        raise ValueError("Snapshot has no results artifact")
    content = (data_dir / "sources" / source_id / "raw" / snapshot_id / result["path"]).read_text(
        encoding="utf-8"
    )
    try:
        extractor = EXTRACTORS[source_id]
    except KeyError as exc:
        raise ValueError(f"No extractor registered for source: {source_id}") from exc
    native = extractor(content)
    if source_id == "deepswe-v1.1":
        detail = next(
            (item for item in manifest["artifacts"] if item["path"] == "artifacts/trials.json"),
            None,
        )
        if detail is not None:
            detail_content = (
                data_dir / "sources" / source_id / "raw" / snapshot_id / detail["path"]
            ).read_text(encoding="utf-8")
            counts: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
            for trial in json.loads(detail_content)["rows"]:
                if trial["included_in_score"]:
                    for metric, field in (
                        ("mean_cost_usd", "cost_usd"),
                        ("mean_duration_seconds", "agent_duration_seconds"),
                    ):
                        if trial[field] is not None:
                            counts[trial["config"]][metric] += 1
            for value in native:
                value["sample_sizes"].update(counts[value["condition"]])
            for value in deepswe.extract_trials(detail_content, content):
                value["_source_path"] = detail["path"]
                native.append(value)
    if source_id in {"terminal-bench-2.1", "terminal-bench-4-0"}:
        root = data_dir / "sources" / source_id / "raw" / snapshot_id
        for published, aggregate in zip(json.loads(content)["rows"], list(native), strict=True):
            for path, index, trial in harbor_trials(root, published):
                if trial["cost_usd"] is not None:
                    native.append(
                        {
                            "_source_path": path,
                            "_source_line": index,
                            "model": aggregate["model"],
                            "harness": aggregate["harness"],
                            "effort": aggregate["effort"],
                            "benchmark": trial["task_name"],
                            "benchmark_version": aggregate["benchmark_version"],
                            "trial": trial["id"],
                            "condition": aggregate["condition"],
                            "failure_type": trial["error_type"],
                            "metrics": {"cost_usd": trial["cost_usd"]},
                        }
                    )
    rows = []
    for value in native:
        source_line = value.pop("_source_line", None)
        if not isinstance(source_line, int) or source_line < 1:
            raise ValueError("Extractor did not provide source line provenance")
        source_path = value.pop("_source_path", result["path"])
        if source_path not in {item["path"] for item in manifest["artifacts"]}:
            raise ValueError(f"Uncaptured source path: {source_path}")
        rows.append(
            {
                "provenance": {
                    "path": source_path,
                    "row": source_line,
                },
                "native": value,
            }
        )
    return rows
