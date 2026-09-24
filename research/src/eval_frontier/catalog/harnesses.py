"""Canonical harness values."""

from ..schemas.harnesses import HarnessDefinition

HARNESSES = {
    item.id: item
    for item in [
        HarnessDefinition(id="codex", label="Codex"),
        HarnessDefinition(id="opencode", label="OpenCode"),
        HarnessDefinition(id="cursor", label="Cursor"),
        HarnessDefinition(id="claude-code", label="Claude Code"),
        HarnessDefinition(id="mini-swe-agent", label="mini-swe-agent"),
        HarnessDefinition(id="terminus-2", label="Terminus 2"),
        HarnessDefinition(id="gemini-cli", label="Gemini CLI"),
        HarnessDefinition(id="grok-build", label="Grok Build"),
        HarnessDefinition(id="muse-code", label="Muse Code"),
        HarnessDefinition(id="chisel", label="Chisel"),
        HarnessDefinition(id="devin", label="Devin"),
        HarnessDefinition(id="cursor-cli", label="Cursor CLI"),
    ]
}
