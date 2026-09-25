"""Read captured Harbor CLI trials and capture DeepSWE trial metadata."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import HttpUrl

from ..schemas.sources import SourceArtifact
from .archive import capture


def capture_details(data_dir: Path, source_id: str) -> str:
    artifacts = []
    if source_id == "deepswe-v1.1":
        artifacts.append(
            SourceArtifact(
                path="trials.json",
                role="provenance",
                url=HttpUrl("https://deepswe.datacurve.ai/artifacts/v1.1/trials.json"),
            )
        )
    elif source_id in {"terminal-bench-2.1", "terminal-bench-4-0"}:
        raise ValueError(f"Use capture-harbor for {source_id}")
    else:
        raise ValueError(f"No public detail capture configured for {source_id}")
    return capture(data_dir, source_id, artifacts)


def harbor_trials(root: Path, row: dict[str, Any]) -> list[tuple[str, int, dict[str, Any]]]:
    """Join CLI row associations to captured job trials with exact locations."""
    association_path = root / f"artifacts/row-trials/{row['id']}.json"
    if not association_path.is_file():
        raise ValueError(f"Missing Harbor row associations: {row['id']}")
    listing = json.loads(association_path.read_text(encoding="utf-8"))
    if (
        listing["total_pages"] != 1
        or len(listing["items"]) != listing["total"]
        or listing["page"] != 1
    ):
        raise ValueError(f"Incomplete Harbor row associations: {row['id']}")
    index = _harbor_cli_index(root)
    ids = [item["trial_id"] for item in listing["items"]]
    if len(ids) != len(set(ids)):
        raise ValueError(f"Duplicate associated Harbor trial: {row['id']}")
    if set(ids) - index.keys():
        raise ValueError(f"Missing Harbor job trial for row: {row['id']}")
    return [index[trial_id] for trial_id in ids]


@lru_cache(maxsize=8)
def _harbor_cli_index(root: Path) -> dict[str, tuple[str, int, dict[str, Any]]]:
    index = {}
    for job in sorted((root / "artifacts/job-trials").iterdir()):
        files = sorted(job.glob("*.json"), key=lambda file: int(file.stem))
        expected_total = None
        expected_pages = None
        found = 0
        for page, file in enumerate(files, 1):
            path = file.relative_to(root).as_posix()
            listing = json.loads(file.read_text(encoding="utf-8"))
            if expected_total is None:
                expected_total = listing["total"]
                expected_pages = listing["total_pages"]
            if (
                listing["page"] != page
                or int(file.stem) != page
                or listing["total"] != expected_total
                or listing["total_pages"] != expected_pages
            ):
                raise ValueError(f"Harbor job pagination mismatch: {path}")
            found += len(listing["items"])
            for number, trial in enumerate(listing["items"], 1):
                if trial["id"] in index:
                    raise ValueError(f"Duplicate Harbor job trial: {trial['id']}")
                if trial["cost_usd"] is not None and trial["cost_usd"] < 0:
                    raise ValueError(f"Negative Harbor trial cost: {trial['id']}")
                index[trial["id"]] = (path, number, trial)
        if len(files) != expected_pages or found != expected_total:
            raise ValueError(f"Incomplete Harbor job trials: {job.name}")
    return index
