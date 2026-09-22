"""Canonical model values."""

from ..schemas.models import ModelDefinition

MODELS = {
    item.id: item
    for item in [
        ModelDefinition(id="gpt-5", label="GPT-5"),
        ModelDefinition(id="gpt-5.2", label="GPT-5.2"),
        ModelDefinition(id="gpt-5.5", label="GPT-5.5"),
        ModelDefinition(id="glm-5.2", label="GLM-5.2"),
        ModelDefinition(id="deepseek-v4-flash", label="DeepSeek V4 Flash"),
        ModelDefinition(id="kimi-k2.7-code", label="Kimi K2.7 Code"),
        ModelDefinition(id="glm-4.7-flash", label="GLM-4.7 Flash"),
        ModelDefinition(id="kimi-k3", label="Kimi K3"),
        ModelDefinition(id="claude-opus-5", label="Claude Opus 5"),
        ModelDefinition(id="claude-opus-4-8", label="Claude Opus 4.8"),
        ModelDefinition(id="claude-sonnet-5", label="Claude Sonnet 5"),
        ModelDefinition(id="nemotron-ultra-550b", label="Nemotron Ultra 550B"),
        ModelDefinition(id="devstral-2-123b", label="Devstral 2 123B"),
        ModelDefinition(id="minimax-m2.5", label="MiniMax M2.5"),
        ModelDefinition(id="qwen3.6-35b", label="Qwen3.6 35B"),
        ModelDefinition(id="qwen3-coder-480b", label="Qwen3 Coder 480B"),
        ModelDefinition(id="claude-haiku-4-5", label="Claude Haiku 4.5"),
        ModelDefinition(id="qwen3.8-27b", label="Qwen3.8 27B"),
        ModelDefinition(id="grok-4.6", label="Grok 4.6"),
        ModelDefinition(id="gemma-4-31b", label="Gemma 4 31B"),
        ModelDefinition(id="qwen3-coder-30b", label="Qwen3 Coder 30B"),
        ModelDefinition(id="deepseek-v3.2", label="DeepSeek V3.2"),
    ]
}
