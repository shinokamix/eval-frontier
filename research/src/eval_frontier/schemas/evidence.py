"""Schema for one canonical evidence measurement."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, FiniteFloat


class EvidenceRow(BaseModel):
    """One canonical measurement from a source experiment."""

    model_config = ConfigDict(extra="forbid")

    source_id: str
    snapshot_id: str
    study_id: str
    source_path: str
    source_locator: str

    benchmark_id: str
    benchmark_version: str | None = None
    task_id: str | None = None
    trial_id: str | None = None
    attempt_id: str | None = None

    model_id: str
    harness_id: str
    effort: str | None = None
    condition: str | None = None

    metric_id: str
    value: FiniteFloat
    unit: str
    statistic: str
    direction: Literal["higher", "lower"]

    sample_size: int | None = Field(default=None, ge=1)
    standard_error: FiniteFloat | None = Field(default=None, ge=0)
    interval_lower: FiniteFloat | None = None
    interval_upper: FiniteFloat | None = None
    timed_out: bool | None = None
    failure_type: str | None = None
