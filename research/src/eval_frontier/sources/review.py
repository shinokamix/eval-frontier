"""Load the reviewed analysis decisions and check them against the evidence."""

from __future__ import annotations

from pathlib import Path

from ..catalog import HARNESSES, METRICS, MODELS
from ..schemas.evidence import EvidenceRow
from ..schemas.review import SourceReview
from ..schemas.sources import SourcePins
from .archive import read_json


def _pins(data_dir: Path) -> dict[str, str]:
    return SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources


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


def current_reviews(data_dir: Path) -> tuple[dict[str, SourceReview], list[str]]:
    """Reviews made for the pinned snapshots, and pinned sources that lack one.

    A source without `review.json`, or whose review names another snapshot,
    has no decisions the analysis may apply until it is reviewed again.
    """
    reviews, unreviewed = {}, []
    for source_id, snapshot_id in sorted(_pins(data_dir).items()):
        path = data_dir / "sources" / source_id / "review.json"
        review = load_review(data_dir, source_id) if path.is_file() else None
        if review is None or review.snapshot_id != snapshot_id:
            unreviewed.append(source_id)
        else:
            reviews[source_id] = review
    return reviews, unreviewed


def check_reviews(data_dir: Path, rows: list[EvidenceRow]) -> list[str]:
    """Stop when a current review refers to evidence that does not exist.

    Returns the pinned sources that still need a review.
    """
    reviews, unreviewed = current_reviews(data_dir)
    for source_id, review in reviews.items():
        source_rows = [row for row in rows if row.source_id == source_id]
        for name, outcome in (("quality", review.quality), ("cost", review.cost)):
            if outcome.metric_id is not None and not any(
                row.metric_id == outcome.metric_id and row.level == outcome.level
                for row in source_rows
            ):
                raise ValueError(
                    f"{source_id} review names {name} metric {outcome.metric_id} "
                    f"at {outcome.level} level, which the evidence lacks"
                )
        if review.unscored_attempts is not None and not any(
            row.scored is False for row in source_rows
        ):
            raise ValueError(f"{source_id} review decides on unscored attempts it has none of")
        for exclusion in review.exclusions:
            fields = ("campaign_id", "model_id", "harness_id", "effort")
            if not any(
                all(getattr(exclusion, f) in (None, getattr(row, f)) for f in fields)
                for row in source_rows
            ):
                raise ValueError(f"{source_id} review excludes evidence that does not exist")
    return unreviewed
