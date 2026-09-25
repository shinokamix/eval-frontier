"""Schemas for source definitions, pins, and canonical mappings."""

from __future__ import annotations

import re
from pathlib import PurePosixPath
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator

SOURCE_ID_PATTERN = r"^[a-z0-9]+(?:[.-][a-z0-9]+)*$"
SNAPSHOT_ID_PATTERN = r"^[0-9a-f]{64}$"


class SourceArtifact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: str = Field(min_length=1)
    role: Literal["license", "methodology", "provenance", "results", "summary"]
    url: HttpUrl
    capture_command: list[str] | None = Field(default=None, alias="captureCommand")
    range_start: int | None = Field(default=None, alias="rangeStart", ge=0)
    range_end: int | None = Field(default=None, alias="rangeEnd", ge=0)

    @field_validator("path")
    @classmethod
    def validate_path(cls, path: str) -> str:
        parsed = PurePosixPath(path)
        if parsed.is_absolute() or ".." in parsed.parts:
            raise ValueError("Source artifact path must stay within the snapshot")
        return path

    @model_validator(mode="after")
    def validate_range(self) -> SourceArtifact:
        if (self.range_start is None) != (self.range_end is None):
            raise ValueError("Source artifact byte range needs both boundaries")
        if (
            self.range_start is not None
            and self.range_end is not None
            and self.range_end < self.range_start
        ):
            raise ValueError("Source artifact byte range is reversed")
        return self


class SourceDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_version: Literal[1] = Field(alias="schemaVersion")
    id: str = Field(pattern=SOURCE_ID_PATTERN)
    title: str = Field(min_length=1)
    canonical_url: HttpUrl = Field(alias="canonicalUrl")
    license: str = Field(min_length=1)
    redistribution: str = Field(min_length=1)
    artifacts: list[SourceArtifact] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_artifacts(self) -> SourceDefinition:
        paths = [artifact.path for artifact in self.artifacts]
        if len(paths) != len(set(paths)):
            raise ValueError("Source artifact paths must be unique")
        if sum(artifact.role == "results" for artifact in self.artifacts) != 1:
            raise ValueError("Source must define exactly one results artifact")
        return self


class SourcePins(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_version: Literal[1] = Field(alias="schemaVersion")
    sources: dict[str, str] = Field(min_length=1)

    @field_validator("sources")
    @classmethod
    def validate_sources(cls, sources: dict[str, str]) -> dict[str, str]:
        for source_id, snapshot_id in sources.items():
            if re.fullmatch(SOURCE_ID_PATTERN, source_id) is None:
                raise ValueError(f"Invalid source ID: {source_id}")
            if re.fullmatch(SNAPSHOT_ID_PATTERN, snapshot_id) is None:
                raise ValueError(f"Invalid snapshot ID for {source_id}")
        return sources


class SourceCrosswalk(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_version: Literal[1] = Field(alias="schemaVersion")
    models: dict[str, str] = Field(min_length=1)
    harnesses: dict[str, str] = Field(min_length=1)
    metrics: dict[str, str] = Field(min_length=1)
