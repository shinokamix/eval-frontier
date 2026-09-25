"""Build the canonical evidence table from pinned source snapshots."""

from __future__ import annotations

from pathlib import Path

from ..schemas.sources import SourceCrosswalk, SourcePins
from ..sources.archive import read_json, source
from ..sources.extract import extract
from .canonicalize import canonicalize_source
from .checks import check_table
from .parquet import write


def build(data_dir: Path, output: Path) -> Path:
    """Build per-source normalized tables and one combined evidence table."""
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    all_rows = []

    for source_id, snapshot_id in sorted(pins.items()):
        source(data_dir, source_id)
        observations = extract(data_dir, source_id, snapshot_id)
        crosswalk = SourceCrosswalk.model_validate(
            read_json(data_dir / "sources" / source_id / "crosswalk.json")
        )
        source_rows = canonicalize_source(
            source_id,
            snapshot_id,
            observations,
            crosswalk,
        )
        write(
            data_dir / "sources" / source_id / "extracted" / snapshot_id / "normalized.parquet",
            source_rows,
        )
        all_rows.extend(source_rows)

    check_table(data_dir, pins, all_rows)
    all_rows.sort(
        key=lambda row: (
            row.source_id,
            row.source_locator,
            row.model_id,
            row.harness_id,
            row.metric_id,
        )
    )
    write(output, all_rows)
    return output
