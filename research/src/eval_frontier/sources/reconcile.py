"""Reconcile captured trial details with the aggregates a source published."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..schemas.sources import SourcePins
from .archive import read_json
from .details import harbor_trials

# Published totals are rounded to cents; trial costs are not.
COST_TOLERANCE_USD = 0.0051

# Sources whose leaderboard rows `harbor_rows` reconciles.
HARBOR_SOURCES = frozenset({"terminal-bench-2.1", "terminal-bench-4-0"})


@dataclass(frozen=True)
class HarborRow:
    """One Terminal-Bench leaderboard row checked against its associated trials."""

    run_id: str
    model: str
    effort: str | None
    published_trials: int
    trials: int
    known_costs: int
    known_cost_sum: float
    published_cost: float
    trials_with_retries: int
    unscored: int
    # Distinct numbers of associated trials per task.
    attempts_per_task: tuple[int, ...]
    # Source tasks without any associated trial of this row.
    missing_tasks: int
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

    @property
    def equal_task_weights(self) -> bool:
        """The published attempts split evenly over every task the source's
        rows cover.

        Only then does a rate or mean over all attempts weight the common
        tasks equally. A task that no row covers goes unnoticed.
        """
        return self.count_matches and len(self.attempts_per_task) == 1 and self.missing_tasks == 0


@dataclass(frozen=True)
class TrialTotals:
    """Counts over every trial a trial-level source captured."""

    trials: int
    known_costs: int
    unscored: int


def _pinned(data_dir: Path, source_id: str) -> tuple[Path, Any]:
    """The pinned snapshot directory and its parsed results artifact."""
    pins = SourcePins.model_validate(read_json(data_dir / "canonical" / "pins.json")).sources
    root = data_dir / "sources" / source_id / "raw" / pins[source_id]
    manifest = read_json(root / "manifest.json")
    results = next(a["path"] for a in manifest["artifacts"] if a["role"] == "results")
    return root, read_json(root / results)


def trial_totals(data_dir: Path, source_id: str) -> TrialTotals:
    """Count trials, known costs, and unscored trials directly in the snapshot.

    The audit compares these with the evidence table, independently of the
    adapters that produced it.
    """
    root, results = _pinned(data_dir, source_id)
    if source_id == "deepswe-v1.1":
        trials = read_json(root / "artifacts" / "trials.json")["rows"]
        return TrialTotals(
            trials=len(trials),
            known_costs=sum(t["cost_usd"] is not None for t in trials),
            unscored=sum(not t["included_in_score"] for t in trials),
        )
    if source_id == "swe-marathon-v1.1":
        trials = [
            trial
            for task in results.values()
            for config in task["configs"]
            for trial in config["trials"]
        ]
        return TrialTotals(
            trials=len(trials),
            known_costs=sum(t["costUsd"] is not None for t in trials),
            unscored=0,
        )
    raise ValueError(f"No trial totals for {source_id}")


def harbor_rows(data_dir: Path, source_id: str) -> list[HarborRow]:
    """Reconcile every leaderboard row of a pinned Terminal-Bench snapshot."""
    root, results = _pinned(data_dir, source_id)
    row_trials = [
        (row, [trial for _, _, trial in harbor_trials(root, row)]) for row in results["rows"]
    ]
    # Every row of a source forms one campaign on the same task set.
    source_tasks = {t["task_name"] for _, trials in row_trials for t in trials}
    rows = []
    for row, trials in row_trials:
        per_task = Counter(t["task_name"] for t in trials)
        costs = [t["cost_usd"] for t in trials if t["cost_usd"] is not None]
        rows.append(
            HarborRow(
                run_id=row["id"],
                model=row["metadata"]["model_display"]["label"],
                effort=row["metadata"]["reasoning_effort"],
                published_trials=row["metrics"]["n_trials"],
                trials=len(trials),
                known_costs=len(costs),
                known_cost_sum=sum(costs),
                published_cost=row["metrics"]["total_cost_usd"],
                trials_with_retries=sum(t["n_attempts"] > 1 for t in trials),
                unscored=sum(not t["is_scored"] for t in trials),
                attempts_per_task=tuple(sorted(set(per_task.values()))),
                missing_tasks=len(source_tasks - per_task.keys()),
                agent_versions=tuple(sorted({t["agent_version"] for t in trials} - {None})),
                trial_ids=tuple(t["id"] for t in trials),
            )
        )
    return rows
