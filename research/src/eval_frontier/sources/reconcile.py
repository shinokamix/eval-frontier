"""Reconcile captured trial details with the aggregates a source published."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..schemas.sources import SourcePins
from .archive import read_json
from .details import harbor_trials

# Published totals are rounded to cents; trial costs are not.
COST_TOLERANCE_USD = 0.0051


@dataclass(frozen=True)
class HarborRow:
    """One Terminal-Bench leaderboard row checked against its associated trials."""

    campaign_id: str
    model: str
    effort: str | None
    published_trials: int
    trials: int
    known_costs: int
    known_cost_sum: float
    published_cost: float
    trials_with_retries: int
    unscored: int
    agent_versions: tuple[str, ...]
    trial_ids: tuple[str, ...]

    @property
    def count_matches(self) -> bool:
        return self.trials == self.published_trials

    @property
    def cost_matches(self) -> bool:
        return abs(self.known_cost_sum - self.published_cost) <= COST_TOLERANCE_USD

    @property
    def complete_cost(self) -> bool:
        return self.known_costs == self.trials

    @property
    def reconciled(self) -> bool:
        """Every trial has a cost and trials add up to the published count and total."""
        return self.complete_cost and self.count_matches and self.cost_matches

    @property
    def no_retries(self) -> bool:
        return self.trials_with_retries == 0 and self.unscored == 0


def harbor_rows(data_dir: Path, source_id: str) -> list[HarborRow]:
    """Reconcile every leaderboard row of a pinned Terminal-Bench snapshot."""
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    root = data_dir / "sources" / source_id / "raw" / pins[source_id]
    manifest = read_json(root / "manifest.json")
    results = next(a["path"] for a in manifest["artifacts"] if a["role"] == "results")
    rows = []
    for row in read_json(root / results)["rows"]:
        trials = [trial for _, _, trial in harbor_trials(root, row)]
        costs = [t["cost_usd"] for t in trials if t["cost_usd"] is not None]
        rows.append(
            HarborRow(
                campaign_id=row["id"],
                model=row["metadata"]["model_display"]["label"],
                effort=row["metadata"]["reasoning_effort"],
                published_trials=row["metrics"]["n_trials"],
                trials=len(trials),
                known_costs=len(costs),
                known_cost_sum=sum(costs),
                published_cost=row["metrics"]["total_cost_usd"],
                trials_with_retries=sum(t["n_attempts"] > 1 for t in trials),
                unscored=sum(not t["is_scored"] for t in trials),
                agent_versions=tuple(sorted({t["agent_version"] for t in trials} - {None})),
                trial_ids=tuple(t["id"] for t in trials),
            )
        )
    return rows
