"""Convert source-native rows into validated canonical evidence rows."""

from __future__ import annotations

from typing import Any

from ..catalog import HARNESSES, METRICS, MODELS
from ..schemas.evidence import EvidenceRow
from ..schemas.sources import SourceCrosswalk


def _mapped(mapping: dict[str, str], value: str, kind: str) -> str:
    try:
        return mapping[value]
    except KeyError as exc:
        raise ValueError(f"Unmapped {kind}: {value}") from exc


def canonicalize_source(
    source_id: str,
    snapshot_id: str,
    observations: list[dict[str, Any]],
    crosswalk: SourceCrosswalk,
) -> list[EvidenceRow]:
    rows: list[EvidenceRow] = []
    for entry in observations:
        native = entry["native"]
        model_id = _mapped(crosswalk.models, native["model"], "model")
        harness_id = _mapped(crosswalk.harnesses, native["harness"], "harness")
        if model_id not in MODELS or harness_id not in HARNESSES:
            raise ValueError(f"Unknown canonical configuration: {model_id}/{harness_id}")

        for source_metric, value in native["metrics"].items():
            metric_id = _mapped(crosswalk.metrics, source_metric, "metric")
            try:
                metric = METRICS[metric_id]
            except KeyError as exc:
                raise ValueError(f"Unknown canonical metric: {metric_id}") from exc
            rows.append(
                EvidenceRow(
                    source_id=source_id,
                    snapshot_id=snapshot_id,
                    study_id=source_id,
                    source_path=entry["provenance"]["path"],
                    source_locator=f"row:{entry['provenance']['row']}",
                    benchmark_id=native["benchmark"] if native.get("aggregate") else source_id,
                    benchmark_version=native.get("benchmark_version"),
                    task_id=None if native.get("aggregate") else native["benchmark"],
                    trial_id=native.get("trial"),
                    model_id=model_id,
                    harness_id=harness_id,
                    effort=native.get("effort"),
                    condition=native.get("condition"),
                    metric_id=metric_id,
                    value=float(value),
                    unit=metric.unit,
                    statistic=metric.statistic,
                    direction=metric.direction,
                    sample_size=native.get("sample_sizes", {}).get(source_metric),
                    standard_error=native.get("standard_errors", {}).get(source_metric),
                )
            )
    return rows
