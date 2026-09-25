"""Table-level contract checks that single-row validation cannot express."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

from ..schemas.evidence import EvidenceRow

GRAIN = (
    "source_id",
    "study_id",
    "benchmark_id",
    "task_id",
    "trial_id",
    "attempt_id",
    "model_id",
    "harness_id",
    "effort",
    "campaign_id",
    "metric_id",
)


def check_table(data_dir: Path, pins: dict[str, str], rows: list[EvidenceRow]) -> None:
    """Stop the build when rows break the table contract in DATASETS.md."""
    snapshots = {(row.source_id, row.snapshot_id) for row in rows}
    if snapshots != set(pins.items()):
        raise ValueError(f"Evidence snapshots differ from pins: {sorted(snapshots)}")

    duplicates = [
        key
        for key, count in Counter(tuple(getattr(row, f) for f in GRAIN) for row in rows).items()
        if count > 1
    ]
    if duplicates:
        raise ValueError(f"Rows share the evidence grain: {duplicates[:3]}")

    missing = sorted(
        f"{source_id}/{path}"
        for source_id, snapshot_id, path in {
            (row.source_id, row.snapshot_id, row.source_path) for row in rows
        }
        if not (data_dir / "sources" / source_id / "raw" / snapshot_id / path).is_file()
    )
    if missing:
        raise ValueError(f"Evidence source paths are not captured: {missing[:3]}")
