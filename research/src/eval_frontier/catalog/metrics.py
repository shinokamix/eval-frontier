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
        MetricDefinition(
            id="mean_score_excl_failed",
            label="Mean score excluding failed tasks",
            unit="score",
            statistic="mean",
            direction="higher",
        ),
        MetricDefinition(
            id="completed_tasks",
            label="Scored tasks",
            unit="tasks",
            statistic="count",
            direction="higher",
        ),
        MetricDefinition(
            id="tokens_processed_millions",
            label="Tokens processed in millions, rounded",
            unit="million tokens",
            statistic="sum",
            direction="lower",
        ),
        MetricDefinition(
            id="wall_clock_minutes",
            label="Wall-clock minutes, rounded",
            unit="minutes",
            statistic="sum",
            direction="lower",
        ),
        *[
            MetricDefinition(
                id=f"{metric}_{basis}_usd",
                label=f"{label}, {basis_label}",
                unit="USD"
                if metric == "run_cost"
                else "USD per task"
                if metric == "cost_per_task"
                else "USD per score point",
                statistic="sum" if metric == "run_cost" else "ratio",
                direction="lower",
            )
            for basis, basis_label in (
                ("metered", "Bedrock metered"),
                ("hardware_derived", "self-hosted hardware-derived"),
            )
            for metric, label in (
                ("run_cost", "Run cost"),
                ("cost_per_task", "Cost per scored task"),
                ("cost_per_point", "Cost per mean score point"),
            )
        ],
    ]
}
