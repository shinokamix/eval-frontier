"""Command-line entry point for evaluation frontier research workflows."""

from __future__ import annotations

import argparse
from collections.abc import Sequence
from pathlib import Path

from .pipeline import build, capture, extract, verify_sources


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""
    parser = argparse.ArgumentParser(prog="eval-frontier")
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("build", "verify"):
        commands.add_parser(name, help=f"{name.capitalize()} research outputs.")
    capture_parser = commands.add_parser("capture", help="Capture a source snapshot.")
    capture_parser.add_argument("source_id")
    extract_parser = commands.add_parser("extract", help="Extract a pinned source.")
    extract_parser.add_argument("source_id")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run a research workflow command."""
    args = build_parser().parse_args(argv)
    root = Path(__file__).resolve().parents[3]
    data_dir = root / "research" / "data"
    output = root / "research" / "build" / "research.json"
    if args.command == "capture":
        print(f"Captured {args.source_id}: {capture(data_dir, args.source_id)}")
    elif args.command == "verify":
        print(f"Verified {verify_sources(data_dir)} snapshots.")
    elif args.command == "extract":
        print(f"Extracted {args.source_id} to {extract(data_dir, args.source_id)}")
    elif args.command == "build":
        print(f"Wrote {build(data_dir, output)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
