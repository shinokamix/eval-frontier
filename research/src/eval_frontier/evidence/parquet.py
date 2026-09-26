"""Read and write the canonical evidence Parquet artifact."""

from __future__ import annotations

from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from ..schemas.evidence import EvidenceRow

EVIDENCE_SCHEMA = pa.schema(
    [
        pa.field("source_id", pa.string(), nullable=False),
        pa.field("snapshot_id", pa.string(), nullable=False),
        pa.field("study_id", pa.string(), nullable=False),
        pa.field("source_path", pa.string(), nullable=False),
        pa.field("source_locator", pa.string(), nullable=False),
        pa.field("benchmark_id", pa.string(), nullable=False),
        pa.field("benchmark_version", pa.string()),
        pa.field("task_id", pa.string()),
        pa.field("trial_id", pa.string()),
        pa.field("attempt_id", pa.string()),
        pa.field("model_id", pa.string(), nullable=False),
        pa.field("harness_id", pa.string(), nullable=False),
        pa.field("effort", pa.string()),
        pa.field("run_id", pa.string()),
        pa.field("metric_id", pa.string(), nullable=False),
        pa.field("value", pa.float64(), nullable=False),
        pa.field("unit", pa.string(), nullable=False),
        pa.field("statistic", pa.string(), nullable=False),
        pa.field("direction", pa.string(), nullable=False),
        pa.field("sample_size", pa.int64()),
        pa.field("standard_error", pa.float64()),
        pa.field("interval_lower", pa.float64()),
        pa.field("interval_upper", pa.float64()),
        pa.field("outcome_status", pa.string()),
        pa.field("scored", pa.bool_()),
        pa.field("attempt_count", pa.int64()),
        pa.field("agent_version", pa.string()),
        pa.field("timed_out", pa.bool_()),
        pa.field("failure_type", pa.string()),
    ]
)


def write(path: Path, rows: list[EvidenceRow]) -> None:
    if EVIDENCE_SCHEMA.names != list(EvidenceRow.model_fields):
        raise ValueError("Parquet schema and EvidenceRow fields differ")
    path.parent.mkdir(parents=True, exist_ok=True)
    table = pa.Table.from_pylist([row.model_dump() for row in rows], schema=EVIDENCE_SCHEMA)
    pq.write_table(table, path)
