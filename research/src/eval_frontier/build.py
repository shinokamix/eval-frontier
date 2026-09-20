"""Harmonize observations and build the published research artifact."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .extractors import extract
from .snapshots import read_json, sha256, source, write_json


def median(values: list[float]) -> float:
    values = sorted(values)
    n = len(values)
    middle = n // 2
    return values[middle] if n % 2 else (values[middle - 1] + values[middle]) / 2


def harmonize(
    definition: dict[str, Any],
    observations: dict[str, Any],
    crosswalk: dict[str, Any],
    catalogs: tuple[dict[str, Any], dict[str, Any], dict[str, Any]],
    source_url: str,
) -> dict[str, Any]:
    models, harnesses, _metrics_catalog = catalogs

    def mapped(table: dict[str, str], value: str, kind: str) -> str:
        if value not in table:
            raise ValueError(f"Unmapped {kind}: {value}")
        return table[value]

    rows = []
    for entry in observations["rows"]:
        native = entry["native"]
        rows.append(
            {
                **native,
                "model": mapped(crosswalk["models"], native["model"], "model"),
                "harness": mapped(
                    crosswalk["harnesses"], native["harness"], "harness"
                ),
                "metrics": {
                    mapped(crosswalk["metrics"], key, "metric"): value
                    for key, value in native["metrics"].items()
                },
            }
        )

    selected = [
        row
        for row in rows
        if row["model"] == definition["select"]["model"]
        and row["condition"] == definition["select"]["native"]["condition"]
    ]
    if not selected:
        raise ValueError(f"Study {definition['id']} selected no rows")

    groups: dict[tuple[str, str | None], list[dict[str, Any]]] = {}
    for row in selected:
        groups.setdefault((row["harness"], row["effort"]), []).append(row)

    model_labels = {item["id"]: item["label"] for item in models["models"]}
    harness_labels = {item["id"]: item["label"] for item in harnesses["harnesses"]}
    results = []
    for (harness, effort), group in sorted(groups.items()):
        values: dict[str, float] = {}
        for spec in definition["resultMetrics"]:
            vals = [
                row["metrics"][spec["source"]]
                for row in group
                if spec["source"] in row["metrics"]
            ]
            if len(vals) != len(group):
                raise ValueError(f"Missing metric {spec['source']}")
            if spec["kind"] in ("rate", "mean"):
                value = sum(vals) / len(vals)
            elif spec["kind"] == "median":
                value = median(vals)
            else:
                successes = sum(
                    1 for row in group if row["metrics"].get("solved") == 1
                )
                if successes == 0:
                    continue
                value = sum(vals) / successes
            values[spec["id"]] = value
        results.append(
            {
                "id": f"{definition['id']}:{harness}:{effort or 'unknown'}",
                "effort": effort,
                "harness": {"id": harness, "name": harness_labels[harness]},
                "metrics": values,
                "sample": {
                    "tasks": len({row["benchmark"] for row in group}),
                    "trialsPerTask": len({row["trial"] for row in group}),
                    "evaluatedCells": len(group),
                    "successfulAttempts": sum(
                        1
                        for row in group
                        if row["metrics"].get("solved") == 1
                    ),
                },
                "caveats": definition["caveats"],
            }
        )

    def dominates(
        a: dict[str, Any], b: dict[str, Any], x: str, y: str
    ) -> bool:
        ax, ay = a["metrics"].get(x), a["metrics"].get(y)
        bx, by = b["metrics"].get(x), b["metrics"].get(y)
        return (
            ax is not None
            and ay is not None
            and bx is not None
            and by is not None
            and ay >= by
            and ax <= bx
            and (ay > by or ax < bx)
        )

    comparisons = []
    for comparison in definition["comparisons"]:
        eligible = [
            result["id"]
            for result in results
            if comparison["xMetric"] in result["metrics"]
            and comparison["yMetric"] in result["metrics"]
        ]
        front = [
            result["id"]
            for result in results
            if result["id"] in eligible
            and not any(
                other["id"] != result["id"]
                and dominates(
                    other,
                    result,
                    comparison["xMetric"],
                    comparison["yMetric"],
                )
                for other in results
            )
        ]
        comparisons.append(
            {
                "id": comparison["id"],
                "status": (
                    comparison["status"]
                    if len(eligible) >= 2
                    else "insufficient_data"
                ),
                "xMetric": comparison["xMetric"],
                "yMetric": comparison["yMetric"],
                "eligibleResults": eligible,
                "paretoFront": front if len(eligible) >= 2 else [],
            }
        )

    return {
        "id": definition["id"],
        "title": definition["title"],
        "model": {
            "id": definition["model"],
            "label": model_labels[definition["model"]],
        },
        "benchmark": definition["benchmark"],
        "qualityMetric": definition["qualityMetric"],
        "source": {
            "id": definition["sourceId"],
            "url": source_url,
            "evidenceGrade": definition["evidenceGrade"],
        },
        "results": results,
        "comparisons": comparisons,
    }


def build(data_dir: Path, output: Path) -> Path:
    pins = read_json(data_dir / "canonical" / "pins.json")["sources"]
    studies = read_json(data_dir / "canonical" / "studies.json")["studies"]
    catalogs = (
        read_json(data_dir / "canonical" / "models.json"),
        read_json(data_dir / "canonical" / "harnesses.json"),
        read_json(data_dir / "canonical" / "metrics.json"),
    )
    observations: dict[str, dict[str, Any]] = {}
    for source_id, snap in pins.items():
        path = extract(data_dir, source_id, snap)
        observations[source_id] = read_json(path)

    result = {"schemaVersion": 2, "studies": []}
    for definition in studies:
        source_id = definition["sourceId"]
        crosswalk = read_json(data_dir / "sources" / source_id / "crosswalk.json")
        source_definition = source(data_dir, source_id)
        result["studies"].append(
            harmonize(
                definition,
                observations[source_id],
                crosswalk,
                catalogs,
                source_definition["canonicalUrl"],
            )
        )
    write_json(output, result)
    write_json(
        output.with_name("manifest.json"),
        {
            "schemaVersion": 1,
            "pipelineVersion": "0.1.0",
            "sourceSnapshots": dict(sorted(pins.items())),
            "artifact": {
                "path": output.name,
                "sha256": sha256(output.read_bytes()),
            },
        },
    )
    return output
