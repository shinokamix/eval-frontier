"""Capture leaderboard results and associated trial metadata with Harbor CLI."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .archive import sha256, snapshot_id, source, verify_snapshot, write_json

LEADERBOARDS = {
    "terminal-bench-2.1": "terminal-bench/terminal-bench-2-1/main",
    "terminal-bench-4-0": "terminal-bench/terminal-bench/4-0-0",
}


def _command(*args: str) -> tuple[bytes, dict[str, Any]]:
    command = ["harbor", *args, "--json"]
    result = subprocess.run(command, capture_output=True, check=True)
    try:
        parsed = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Harbor CLI did not return JSON: {' '.join(command)}") from exc
    return result.stdout, parsed


def capture_harbor_cli(data_dir: Path, source_id: str) -> str:
    definition = source(data_dir, source_id)
    try:
        ref = LEADERBOARDS[source_id]
    except KeyError as exc:
        raise ValueError(f"No Harbor CLI capture configured for {source_id}") from exc
    results = next(item for item in definition.artifacts if item.role == "results")
    expected_command = ["harbor", "hub", "leaderboard", "show", ref, "--json"]
    if results.capture_command != expected_command:
        raise ValueError(f"Unexpected Harbor CLI capture command for {source_id}")
    version = subprocess.run(
        ["harbor", "--version"], capture_output=True, text=True, check=True
    ).stdout.strip()
    artifacts: list[dict[str, Any]] = []
    payloads: dict[str, bytes] = {}

    def collect(path: str, role: str, *args: str) -> dict[str, Any]:
        body, parsed = _command(*args)
        artifact_path = f"artifacts/{path}"
        payloads[artifact_path] = body
        artifacts.append(
            {
                "path": artifact_path,
                "role": role,
                "mediaType": "application/json",
                "sha256": sha256(body),
                "acquisition": {
                    "type": "harbor-cli",
                    "version": version,
                    "command": ["harbor", *args, "--json"],
                },
            }
        )
        return parsed

    leaderboard = collect("leaderboard.json", "results", "hub", "leaderboard", "show", ref)
    rows = leaderboard["rows"]
    if not rows:
        raise ValueError(f"Empty Harbor leaderboard: {ref}")
    associated: set[str] = set()
    for row in rows:
        row_id = row["id"]
        listing = collect(
            f"row-trials/{row_id}.json",
            "provenance",
            "hub",
            "leaderboard",
            "row",
            "trial",
            "list",
            row_id,
            "--limit",
            "1000",
            "--page",
            "1",
        )
        if (
            listing["total_pages"] != 1
            or listing["page"] != 1
            or len(listing["items"]) != listing["total"]
        ):
            raise ValueError(f"Incomplete Harbor row associations: {row_id}")
        ids = [item["trial_id"] for item in listing["items"]]
        if len(ids) != len(set(ids)):
            raise ValueError(f"Duplicate Harbor row association: {row_id}")
        associated.update(ids)

    remaining = set(associated)
    jobs: set[str] = set()
    while remaining:
        seed = min(remaining)
        detail = collect(f"trial-lookups/{seed}.json", "provenance", "hub", "trial", "show", seed)
        job_id = detail["job_id"]
        if job_id in jobs:
            raise ValueError(f"Harbor job did not contain associated trial: {seed}")
        jobs.add(job_id)
        page = 1
        found: set[str] = set()
        expected_total: int | None = None
        expected_pages: int | None = None
        while True:
            listing = collect(
                f"job-trials/{job_id}/{page}.json",
                "provenance",
                "hub",
                "job",
                "trials",
                job_id,
                "--include-retries",
                "--limit",
                "1000",
                "--page",
                str(page),
            )
            if expected_total is None:
                expected_total = listing["total"]
                expected_pages = listing["total_pages"]
            if (
                listing["page"] != page
                or listing["total"] != expected_total
                or listing["total_pages"] != expected_pages
                or listing["total_pages"] < page
            ):
                raise ValueError(f"Invalid Harbor job pagination: {job_id}/{page}")
            found.update(item["id"] for item in listing["items"])
            if page == listing["total_pages"]:
                break
            page += 1
        if len(found) != expected_total:
            raise ValueError(f"Incomplete Harbor job trials: {job_id}")
        if seed not in found:
            raise ValueError(f"Harbor job did not contain associated trial: {seed}")
        remaining.difference_update(found)

    snap = snapshot_id(artifacts)
    destination = data_dir / "sources" / source_id / "raw" / snap
    if not destination.exists():
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = Path(tempfile.mkdtemp(prefix=".capture-", dir=destination.parent))
        try:
            for path, body in payloads.items():
                target = temporary / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(body)
            write_json(
                temporary / "manifest.json",
                {
                    "schemaVersion": 1,
                    "snapshotId": snap,
                    "sourceId": source_id,
                    "title": definition.title,
                    "canonicalUrl": str(definition.canonical_url),
                    "capturedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                    "license": definition.license,
                    "redistribution": definition.redistribution,
                    "artifacts": artifacts,
                },
            )
            temporary.rename(destination)
        finally:
            if temporary.exists():
                shutil.rmtree(temporary)
    verify_snapshot(data_dir, source_id, snap)
    return snap
