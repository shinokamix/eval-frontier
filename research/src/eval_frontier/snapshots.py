"""Capture and verify immutable source snapshots."""

from __future__ import annotations

import hashlib
import json
import shutil
import tempfile
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source(data_dir: Path, source_id: str) -> dict[str, Any]:
    value = read_json(data_dir / "sources" / source_id / "source.json")
    if value.get("schemaVersion") != 1 or value.get("id") != source_id:
        raise ValueError(f"Invalid source definition: {source_id}")
    return value


def snapshot_id(artifacts: list[dict[str, Any]]) -> str:
    # JS uses localeCompare. Its default collation places lowercase before
    # uppercase when the folded strings are otherwise equal.
    def collation(value: str) -> tuple[str, tuple[int, ...]]:
        return (
            value.lower(),
            tuple(0 if char.islower() else 1 for char in value),
        )

    identity = sorted(
        ({"path": artifact["path"], "sha256": artifact["sha256"]} for artifact in artifacts),
        key=lambda item: collation(item["path"]),
    )
    return sha256(json.dumps(identity, separators=(",", ":")).encode())


def verify_snapshot(data_dir: Path, source_id: str, snap: str) -> dict[str, Any]:
    root = data_dir / "sources" / source_id / "raw" / snap
    manifest = read_json(root / "manifest.json")
    if manifest.get("snapshotId") != snap or manifest.get("sourceId") != source_id:
        raise ValueError("Snapshot identity mismatch")
    if snapshot_id(manifest["artifacts"]) != snap:
        raise ValueError("Snapshot identity mismatch")
    for artifact in manifest["artifacts"]:
        path = root / artifact["path"]
        if sha256(path.read_bytes()) != artifact["sha256"]:
            raise ValueError(f"Artifact checksum mismatch: {artifact['path']}")
    return manifest


def capture(data_dir: Path, source_id: str) -> str:
    definition = source(data_dir, source_id)
    captured: list[dict[str, Any]] = []
    payloads: list[tuple[dict[str, Any], bytes]] = []
    for artifact in definition["artifacts"]:
        request = urllib.request.Request(artifact["url"], headers={"User-Agent": "eval-frontier"})
        with urllib.request.urlopen(request) as response:
            body = response.read()
            final_url = response.geturl()
            status = response.status
            media_type = response.headers.get("content-type")
        captured.append(
            {
                "path": f"artifacts/{artifact['path']}",
                "role": artifact["role"],
                "mediaType": media_type,
                "sha256": sha256(body),
                "acquisition": {
                    "type": "http",
                    "url": artifact["url"],
                    "finalUrl": final_url,
                    "method": "GET",
                    "status": status,
                },
            }
        )
        payloads.append((artifact, body))

    snap = snapshot_id(captured)
    destination = data_dir / "sources" / source_id / "raw" / snap
    if not destination.exists():
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = Path(tempfile.mkdtemp(prefix=".capture-", dir=str(destination.parent)))
        try:
            (temporary / "artifacts").mkdir()
            for artifact, body in payloads:
                (temporary / "artifacts" / artifact["path"]).write_bytes(body)
            write_json(
                temporary / "manifest.json",
                {
                    "schemaVersion": 1,
                    "snapshotId": snap,
                    "sourceId": source_id,
                    "title": definition["title"],
                    "canonicalUrl": definition["canonicalUrl"],
                    "capturedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                    "license": definition["license"],
                    "redistribution": definition["redistribution"],
                    "artifacts": captured,
                },
            )
            temporary.rename(destination)
        finally:
            if temporary.exists():
                shutil.rmtree(temporary)
    verify_snapshot(data_dir, source_id, snap)
    return snap


def verify_sources(data_dir: Path) -> int:
    count = 0
    root = data_dir / "sources"
    for directory in sorted(root.iterdir()):
        if not directory.is_dir() or not (directory / "source.json").exists():
            continue
        raw = directory / "raw"
        if not raw.exists():
            continue
        for snap in sorted(raw.iterdir()):
            if snap.is_dir():
                verify_snapshot(data_dir, directory.name, snap.name)
                count += 1
    return count
