"""Schema for a canonical metric definition."""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class MetricDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    unit: str
    statistic: str
    direction: Literal["higher", "lower"]
