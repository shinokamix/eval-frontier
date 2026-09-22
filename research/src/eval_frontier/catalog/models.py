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
    ]
}
