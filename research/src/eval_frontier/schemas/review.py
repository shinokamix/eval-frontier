"""Schema for the reviewed analysis decisions about one pinned source."""

from __future__ import annotations

import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .sources import SNAPSHOT_ID_PATTERN, SOURCE_ID_PATTERN

# usable: every configuration can inform the outcome.
# usable_subset: configurations that pass the admission rules can.
# descriptive: values can be shown but cannot enter the primary analysis.
# insufficient: the source cannot inform the outcome.
Readiness = Literal["usable", "usable_subset", "descriptive", "insufficient"]
Level = Literal["trial", "task", "config"]

# complete_coverage: every attempt of the configuration has a known cost.
# matching_total: trials add up to the published attempt count and total cost.
# no_retries: no trial has extra attempts and every trial is scored.
CostRule = Literal["complete_coverage", "matching_total", "no_retries"]


class _Review(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class OutcomeReview(_Review):
    """Which representation of an outcome to use and how far it can be trusted."""

    status: Readiness
    metric_id: str | None = Field(default=None, alias="metricId")
    level: Level | None = None
    notes: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_representation(self) -> OutcomeReview:
        if (self.metric_id is None) != (self.level is None):
            raise ValueError("Outcome metric and level go together")
        if self.status in ("usable", "usable_subset") and self.metric_id is None:
            raise ValueError("A usable outcome needs a metric and level")
        return self


class QualityReview(OutcomeReview):
    # How attempts the publisher left out of its score enter an attempted-task
    # outcome. Null when the source has no such attempts or does not say.
    unscored_attempts: Literal["count_as_failure", "exclude"] | None = Field(
        default=None, alias="unscoredAttempts"
    )


class CostReview(OutcomeReview):
    # What the publisher says the USD figure covers; null when it does not say.
    basis: str | None = None
    basis_confirmed: bool = Field(alias="basisConfirmed")
    admission: list[CostRule] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_admission(self) -> CostReview:
        if (self.status == "usable_subset") != bool(self.admission):
            raise ValueError("Only a usable subset names admission rules")
        return self


class CampaignReview(_Review):
    # What one `campaign_id` value means in this source.
    unit: str = Field(min_length=1)
    # Whether campaigns share tasks or runs with each other or with other
    # captured sources: none, shared, or not yet checked.
    overlap: Literal["none", "shared", "unresolved"]
    notes: list[str] = Field(default_factory=list)


class Exclusion(_Review):
    """Evidence kept out of an outcome by a reviewed decision."""

    outcome: Literal["quality", "cost"]
    campaign_id: str | None = Field(default=None, alias="campaignId")
    model_id: str | None = Field(default=None, alias="modelId")
    harness_id: str | None = Field(default=None, alias="harnessId")
    effort: str | None = None
    reason: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_target(self) -> Exclusion:
        if self.campaign_id is None and self.model_id is None:
            raise ValueError("An exclusion names a campaign or a system")
        return self


class SourceReview(_Review):
    """Reviewed decisions for one source snapshot, read by the analysis."""

    schema_version: Literal[1] = Field(alias="schemaVersion")
    source_id: str = Field(alias="sourceId", pattern=SOURCE_ID_PATTERN)
    snapshot_id: str = Field(alias="snapshotId", pattern=SNAPSHOT_ID_PATTERN)
    reviewed_on: datetime.date = Field(alias="reviewedOn")
    quality: QualityReview
    cost: CostReview
    campaigns: CampaignReview
    exclusions: list[Exclusion] = Field(default_factory=list)
    next_actions: list[str] = Field(default_factory=list, alias="nextActions")
