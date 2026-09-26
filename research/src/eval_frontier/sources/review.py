"""Load the reviewed analysis decisions and check them against the evidence."""

from __future__ import annotations

from pathlib import Path

from ..catalog import HARNESSES, METRICS, MODELS
from ..schemas.evidence import EvidenceRow
from ..schemas.review import SourceReview
from ..schemas.sources import SourcePins
from .archive import read_json

# Metrics that measure whether attempted tasks were solved. Pass@k, partial
# credit, and rubric scores are separate outcomes and cannot represent quality.
QUALITY_METRICS = {"solved", "scored_attempt_pass_rate", "trial_success_rate_pct"}


def _pins(data_dir: Path) -> dict[str, str]:
    return SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources


def _read(data_dir: Path, source_id: str) -> SourceReview:
    review = SourceReview.model_validate(
        read_json(data_dir / "sources" / source_id / "review.json")
    )
    if review.source_id != source_id:
        raise ValueError(f"Review belongs to another source: {source_id}")
    return review


def _check_catalogs(review: SourceReview) -> None:
    source_id = review.source_id
    if review.quality.metric_id is not None and review.quality.metric_id not in QUALITY_METRICS:
        raise ValueError(
            f"{source_id} quality metric is not task success: {review.quality.metric_id}"
        )
    cost_metric = review.cost.metric_id
    if cost_metric is not None and (
        cost_metric not in METRICS or not METRICS[cost_metric].unit.startswith("USD")
    ):
        raise ValueError(f"{source_id} cost metric is not a USD cost: {cost_metric}")
    for exclusion in review.exclusions:
        if exclusion.model_id is not None and exclusion.model_id not in MODELS:
            raise ValueError(f"Unknown model in {source_id} review: {exclusion.model_id}")
        if exclusion.harness_id is not None and exclusion.harness_id not in HARNESSES:
            raise ValueError(f"Unknown harness in {source_id} review: {exclusion.harness_id}")


def current_reviews(data_dir: Path) -> tuple[dict[str, SourceReview], list[str]]:
    """Reviews made for the pinned snapshots, and pinned sources that lack one.

    A source without `review.json`, or whose review names another snapshot,
    has no decisions the analysis may apply until it is reviewed again. Only
    current reviews are checked against the catalogs.
    """
    reviews, unreviewed = {}, []
    for source_id, snapshot_id in sorted(_pins(data_dir).items()):
        path = data_dir / "sources" / source_id / "review.json"
        review = _read(data_dir, source_id) if path.is_file() else None
        if review is None or review.snapshot_id != snapshot_id:
            unreviewed.append(source_id)
        else:
            _check_catalogs(review)
            reviews[source_id] = review
    return reviews, unreviewed


def check_reviews(data_dir: Path, rows: list[EvidenceRow]) -> list[str]:
    """Stop when a current review does not fit the evidence it decides on.

    Returns the pinned sources that still need a review.
    """
    reviews, unreviewed = current_reviews(data_dir)
    for source_id, review in reviews.items():
        source_rows = [row for row in rows if row.source_id == source_id]
        outcomes = {"quality": review.quality, "cost": review.cost}
        for name, outcome in outcomes.items():
            if outcome.metric_id is not None and not any(
                row.metric_id == outcome.metric_id and row.level == outcome.level
                for row in source_rows
            ):
                raise ValueError(
                    f"{source_id} review names {name} metric {outcome.metric_id} "
                    f"at {outcome.level} level, which the evidence lacks"
                )
        if (review.unscored_attempts is not None) != any(
            row.scored is False for row in source_rows
        ):
            raise ValueError(
                f"{source_id} review must decide on unscored attempts exactly when "
                "the evidence has them"
            )
        for exclusion in review.exclusions:
            metric_id = outcomes[exclusion.outcome].metric_id
            fields = ("campaign_id", "model_id", "harness_id", "effort")
            if not any(
                row.metric_id == metric_id
                and all(getattr(exclusion, f) in (None, getattr(row, f)) for f in fields)
                for row in source_rows
            ):
                raise ValueError(
                    f"{source_id} review excludes {exclusion.outcome} evidence that does not exist"
                )
    return unreviewed
