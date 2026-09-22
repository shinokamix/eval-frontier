"""Canonical harness values."""

from ..schemas.harnesses import HarnessDefinition

HARNESSES = {
    item.id: item
    for item in [
        HarnessDefinition(id="codex", label="Codex"),
        HarnessDefinition(id="opencode", label="OpenCode"),
        HarnessDefinition(id="pi", label="Pi"),
        HarnessDefinition(id="cursor", label="Cursor"),
        HarnessDefinition(id="devin", label="Devin"),
    ]
}
