"""Command-line entry point for evaluation frontier research workflows."""

from __future__ import annotations

import argparse
from collections.abc import Sequence
from pathlib import Path

from .evidence.build import build
from .sources.archive import capture, verify_sources
from .sources.details import capture_details
from .sources.extract import extract
from .sources.harbor_cli import capture_harbor_cli


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""
    parser = argparse.ArgumentParser(prog="eval-frontier")
    commands = parser.add_subparsers(dest="command", required=True)
    for name, help_text in {
        "build": "Build evidence tables from pinned snapshots.",
        "verify": "Verify captured snapshot checksums.",
    }.items():
        commands.add_parser(name, help=help_text)
    capture_parser = commands.add_parser("capture", help="Capture a source snapshot.")
    capture_parser.add_argument("source_id")
    harbor_parser = commands.add_parser(
        "capture-harbor", help="Capture a Terminal-Bench leaderboard with Harbor CLI."
    )
    harbor_parser.add_argument("source_id")
    details_parser = commands.add_parser(
        "capture-details", help="Capture trial details with pinned results."
    )
    details_parser.add_argument("source_id")
    extract_parser = commands.add_parser("extract", help="Extract a pinned source.")
    extract_parser.add_argument("source_id")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run a research workflow command."""
    args = build_parser().parse_args(argv)
    root = Path(__file__).resolve().parents[3]
    data_dir = root / "research" / "data"
    output = root / "research" / "data" / "canonical" / "evidence.parquet"
    if args.command == "capture":
        print(f"Captured {args.source_id}: {capture(data_dir, args.source_id)}")
    elif args.command == "capture-harbor":
        print(f"Captured {args.source_id}: {capture_harbor_cli(data_dir, args.source_id)}")
    elif args.command == "capture-details":
        print(f"Captured {args.source_id}: {capture_details(data_dir, args.source_id)}")
    elif args.command == "verify":
        print(f"Verified {verify_sources(data_dir)} snapshots.")
    elif args.command == "extract":
        print(f"Extracted {len(extract(data_dir, args.source_id))} rows from {args.source_id}.")
    elif args.command == "build":
        path, unreviewed = build(data_dir, output)
        print(f"Wrote {path}")
        if unreviewed:
            print(f"Needs review for the pinned snapshot: {', '.join(unreviewed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
