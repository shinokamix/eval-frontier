"""Schema for a canonical model definition."""

from pydantic import BaseModel, ConfigDict


class ModelDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    provider: str | None = None
