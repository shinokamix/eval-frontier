"""Canonical metric values."""

from ..schemas.metrics import MetricDefinition

METRICS = {
    item.id: item
    for item in [
        MetricDefinition(
            id="solved", label="Solved", unit="bool", statistic="value", direction="higher"
        ),
        MetricDefinition(
            id="quality", label="Quality", unit="score", statistic="value", direction="higher"
        ),
        MetricDefinition(
            id="duration_s", label="Duration", unit="seconds", statistic="value", direction="lower"
        ),
        MetricDefinition(
            id="cost_usd", label="Cost", unit="USD", statistic="value", direction="lower"
        ),
        MetricDefinition(
            id="total_tokens",
            label="Total tokens",
            unit="tokens",
            statistic="value",
            direction="lower",
        ),
        MetricDefinition(
            id="input_tokens",
            label="Input tokens",
            unit="tokens",
            statistic="value",
            direction="lower",
        ),
        MetricDefinition(
            id="cached_input_tokens",
            label="Cached input tokens",
            unit="tokens",
            statistic="value",
            direction="lower",
        ),
        MetricDefinition(
            id="output_tokens",
            label="Output tokens",
            unit="tokens",
            statistic="value",
            direction="lower",
        ),
    ]
}
