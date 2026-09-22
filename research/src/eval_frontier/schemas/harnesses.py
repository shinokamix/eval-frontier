"""Schema for a canonical harness definition."""

from pydantic import BaseModel, ConfigDict


class HarnessDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    description: str | None = None
