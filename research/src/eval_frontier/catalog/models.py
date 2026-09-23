"""Canonical model values."""

from ..schemas.models import ModelDefinition

MODELS = {
    item.id: item
    for item in [
        ModelDefinition(id="glm-5.2", label="GLM-5.2"),
        ModelDefinition(id="gpt-5.5", label="GPT-5.5"),
        ModelDefinition(id="deepseek-v4-flash", label="DeepSeek V4 Flash"),
        ModelDefinition(id="kimi-k2.7-code", label="Kimi K2.7 Code"),
        ModelDefinition(id="glm-4.7-flash", label="GLM-4.7 Flash"),
        ModelDefinition(id="kimi-k3", label="Kimi K3"),
        ModelDefinition(id="claude-opus-5", label="Claude Opus 5"),
        ModelDefinition(id="claude-opus-4-8", label="Claude Opus 4.8"),
        ModelDefinition(id="claude-sonnet-5", label="Claude Sonnet 5"),
        ModelDefinition(id="nemotron-ultra-550b", label="Nemotron Ultra 550B"),
        ModelDefinition(id="devstral-2-123b", label="Devstral 2 123B"),
        ModelDefinition(id="claude-fable-5", label="Claude Fable 5"),
        ModelDefinition(id="claude-sonnet-4-6", label="Claude Sonnet 4.6"),
        ModelDefinition(id="deepseek-v4-pro", label="DeepSeek V4 Pro"),
        ModelDefinition(id="gemini-3-1-pro-preview", label="Gemini 3.1 Pro Preview"),
        ModelDefinition(id="gemini-3-5-flash", label="Gemini 3.5 Flash"),
        ModelDefinition(id="gemini-3-6-flash", label="Gemini 3.6 Flash"),
        ModelDefinition(id="gemini-3-7-flash", label="Gemini 3.7 Flash"),
        ModelDefinition(id="gemini-3-8-flash", label="Gemini 3.8 Flash"),
        ModelDefinition(id="glm-5.3", label="GLM-5.3"),
        ModelDefinition(id="glm-5.3-flash", label="GLM-5.3 Flash"),
        ModelDefinition(id="gpt-5.4", label="GPT-5.4"),
        ModelDefinition(id="gpt-5.6-luna", label="GPT-5.6 Luna"),
        ModelDefinition(id="gpt-5.6-sol", label="GPT-5.6 Sol"),
        ModelDefinition(id="gpt-5.6-terra", label="GPT-5.6 Terra"),
        ModelDefinition(id="gpt-6-astra", label="GPT-6 Astra"),
        ModelDefinition(id="gemini-3-pro-preview", label="Gemini 3 Pro Preview"),
        ModelDefinition(id="claude-opus-4-7", label="Claude Opus 4.7"),
        ModelDefinition(id="glm-5.1", label="GLM-5.1"),
        ModelDefinition(id="grok-4.5", label="Grok 4.5"),
        ModelDefinition(id="grok-4.6", label="Grok 4.6"),
        ModelDefinition(id="muse-spark-1.1", label="Muse Spark 1.1"),
        ModelDefinition(id="muse-spark-1.2", label="Muse Spark 1.2"),
        ModelDefinition(id="qwen3.8-max", label="Qwen3.8 Max"),
        ModelDefinition(id="claude-fable-5.1", label="Claude Fable 5.1"),
        ModelDefinition(id="grok-4.7", label="Grok 4.7"),
        ModelDefinition(id="muse-spark-1.3", label="Muse Spark 1.3"),
    ]
}
