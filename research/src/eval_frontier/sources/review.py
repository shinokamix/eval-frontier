"""Load the reviewed analysis decisions for pinned sources."""

from __future__ import annotations

from pathlib import Path

from ..catalog import HARNESSES, METRICS, MODELS
from ..schemas.review import SourceReview
from ..schemas.sources import SourcePins
from .archive import read_json


def load_review(data_dir: Path, source_id: str) -> SourceReview:
    """Read one source's review and check its IDs against the catalogs."""
    review = SourceReview.model_validate(
        read_json(data_dir / "sources" / source_id / "review.json")
    )
    if review.source_id != source_id:
        raise ValueError(f"Review belongs to another source: {source_id}")
    for outcome in (review.quality, review.cost):
        if outcome.metric_id is not None and outcome.metric_id not in METRICS:
            raise ValueError(f"Unknown metric in {source_id} review: {outcome.metric_id}")
    for exclusion in review.exclusions:
        if exclusion.model_id is not None and exclusion.model_id not in MODELS:
            raise ValueError(f"Unknown model in {source_id} review: {exclusion.model_id}")
        if exclusion.harness_id is not None and exclusion.harness_id not in HARNESSES:
            raise ValueError(f"Unknown harness in {source_id} review: {exclusion.harness_id}")
    return review


def load_reviews(data_dir: Path) -> dict[str, SourceReview]:
    """Read the review of every pinned source; each pinned source needs one."""
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    return {source_id: load_review(data_dir, source_id) for source_id in sorted(pins)}


def stale_reviews(data_dir: Path, reviews: dict[str, SourceReview]) -> list[str]:
    """Sources whose review was made for a snapshot other than the pinned one."""
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    return sorted(s for s, review in reviews.items() if review.snapshot_id != pins.get(s))
