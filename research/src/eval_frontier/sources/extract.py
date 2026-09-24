"""Run a source adapter and return source-native rows with provenance."""

from __future__ import annotations

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
    rows = []
    for value in native:
        source_line = value.pop("_source_line", None)
        if not isinstance(source_line, int):
            raise ValueError("Extractor did not provide source line provenance")
        rows.append({"provenance": {"path": result["path"], "row": source_line}, "native": value})
    return rows
