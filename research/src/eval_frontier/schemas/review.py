"""Schema for the reviewed analysis decisions about one pinned source."""

from __future__ import annotations

import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .evidence import Level
from .sources import SNAPSHOT_ID_PATTERN, SOURCE_ID_PATTERN

# usable: every configuration can inform the outcome.
# usable_subset: only configurations that pass the admission rules and are not
#   excluded can inform the outcome.
# descriptive: values can be shown but cannot enter the primary analysis.
# insufficient: the source has no value that represents the outcome.
Readiness = Literal["usable", "usable_subset", "descriptive", "insufficient"]

# complete_coverage: every attempt of the configuration has a known cost.
# matching_total: trials add up to the published attempt count and total cost.
# no_retries: no trial has extra attempts and every trial is scored.
# equal_task_weights: the published attempt count splits evenly over the
#   configuration's tasks, so a published rate or mean weights tasks equally.
Admission = Literal["complete_coverage", "matching_total", "no_retries", "equal_task_weights"]

# Rules about cost records that do not apply to quality.
COST_ONLY_ADMISSION = frozenset({"complete_coverage", "matching_total"})


class _Review(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class OutcomeReview(_Review):
    """Which representation of an outcome to use and how far it can be trusted."""

    status: Readiness
    metric_id: str | None = Field(default=None, alias="metricId")
    level: Level | None = None
    admission: list[Admission] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_representation(self) -> OutcomeReview:
        if (self.metric_id is None) != (self.level is None):
            raise ValueError("Outcome metric and level go together")
        if (self.status == "insufficient") != (self.metric_id is None):
            raise ValueError("Only an insufficient outcome lacks a metric and level")
        if self.admission and self.status != "usable_subset":
            raise ValueError("Only a usable subset names admission rules")
        return self


class CostReview(OutcomeReview):
    # What the publisher says the USD figure covers; null when it does not say.
    basis: str | None = Field(default=None, min_length=1)
    basis_confirmed: bool = Field(alias="basisConfirmed")

    @model_validator(mode="after")
    def validate_cost(self) -> CostReview:
        if self.basis_confirmed and self.basis is None:
            raise ValueError("A confirmed cost basis must be stated")
        return self


class CampaignReview(_Review):
    """How the source's runs form evaluation campaigns.

    A campaign groups runs of several systems on one task set under a common
    scoring and execution protocol. A run alone is not a campaign.
    """

    # What one `run_id` value means in this source.
    run: str = Field(min_length=1)
    # One campaign for the whole source, or one per `run_id` value that
    # several systems share, such as a task subset.
    grouping: Literal["source", "run_id"]
    # The task set, scoring, and execution protocol a campaign shares.
    protocol: str = Field(min_length=1)
    # Whether campaigns share tasks or runs with each other or with other
    # captured sources: none, shared, or not yet checked.
    overlap: Literal["none", "shared", "unresolved"]
    notes: list[str] = Field(default_factory=list)


class Exclusion(_Review):
    """Evidence kept out of an outcome by a reviewed decision.

    Omitted fields match any value, so an exclusion cannot single out a
    system whose effort is unknown.
    """

    outcome: Literal["quality", "cost"]
    run_id: str | None = Field(default=None, alias="runId")
    model_id: str | None = Field(default=None, alias="modelId")
    harness_id: str | None = Field(default=None, alias="harnessId")
    effort: str | None = None
    reason: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_target(self) -> Exclusion:
        if self.run_id is None and self.model_id is None:
            raise ValueError("An exclusion names a run or a system")
        return self


class SourceReview(_Review):
    """Reviewed decisions for one source snapshot, read by the analysis."""

    schema_version: Literal[1] = Field(alias="schemaVersion")
    source_id: str = Field(alias="sourceId", pattern=SOURCE_ID_PATTERN)
    snapshot_id: str = Field(alias="snapshotId", pattern=SNAPSHOT_ID_PATTERN)
    reviewed_on: datetime.date = Field(alias="reviewedOn")
    # How attempts the publisher leaves out of its score (`scored=false`)
    # enter both outcomes, so quality and cost use the same attempts. Null
    # when the source marks no such attempts.
    unscored_attempts: Literal["count_as_failure", "exclude"] | None = Field(
        default=None, alias="unscoredAttempts"
    )
    quality: OutcomeReview
    cost: CostReview
    campaigns: CampaignReview
    exclusions: list[Exclusion] = Field(default_factory=list)
    next_actions: list[str] = Field(default_factory=list, alias="nextActions")

    @model_validator(mode="after")
    def validate_subsets(self) -> SourceReview:
        for name, outcome in (("quality", self.quality), ("cost", self.cost)):
            excluded = any(e.outcome == name for e in self.exclusions)
            if excluded and outcome.status != "usable_subset":
                raise ValueError(f"Only a usable {name} subset has exclusions")
            if outcome.status == "usable_subset" and not (excluded or outcome.admission):
                raise ValueError(f"A usable {name} subset needs admission rules or exclusions")
        if COST_ONLY_ADMISSION & set(self.quality.admission):
            raise ValueError("Quality admission cannot use cost rules")
        return self
