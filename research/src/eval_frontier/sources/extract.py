"""Run a source adapter and return source-native rows with provenance."""

from __future__ import annotations

from pathlib import Path

from ..schemas.sources import SourcePins
from .adapters import kroda, openbench
from .archive import read_json, verify_snapshot

EXTRACTORS = {
    "openbench-m3": lambda content: openbench.extract(content, "m3", no_effort={"devin"}),
    "openbench-m3.5": lambda content: openbench.extract(content, "m3.5"),
    "openbench-m4": lambda content: openbench.extract(content, "m4"),
    "openbench-m4.5": lambda content: openbench.extract(content, "m4.5", excluded={"devin"}),
    "kroda-coding-agent-baselines": kroda.extract,
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
