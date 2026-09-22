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
            id="deepswe_pass_at_1",
            label="DeepSWE pass@1 over scored attempts",
            unit="fraction",
            statistic="ratio",
            direction="higher",
        ),
        MetricDefinition(
            id="deepswe_pass_at_4",
            label="DeepSWE tasks with at least one passing scored attempt",
            unit="fraction",
            statistic="ratio",
            direction="higher",
        ),
        MetricDefinition(
            id="mean_cost_per_scored_attempt_usd",
            label="Mean reported cost per scored attempt",
            unit="USD per attempt",
            statistic="mean",
            direction="lower",
        ),
        MetricDefinition(
            id="mean_duration_per_scored_attempt_s",
            label="Mean duration per scored attempt",
            unit="seconds per attempt",
            statistic="mean",
            direction="lower",
        ),
        MetricDefinition(
            id="terminal_bench_2_1_accuracy_pct",
            label="Terminal-Bench 2.1 successful trials",
            unit="percent",
            statistic="ratio",
            direction="higher",
        ),
        MetricDefinition(
            id="terminal_bench_2_1_reward_hacks_pct",
            label="Terminal-Bench 2.1 trials disqualified for reward hacking",
            unit="percent",
            statistic="ratio",
            direction="lower",
        ),
        *[
            MetricDefinition(
                id=f"terminal_bench_pass_at_{k}",
                label=f"Terminal-Bench pass@{k} task estimate",
                unit="fraction",
                statistic="mean",
                direction="higher",
            )
            for k in range(2, 6)
        ],
        MetricDefinition(
            id="terminal_bench_total_cost_usd",
            label="Terminal-Bench total reported trial cost",
            unit="USD",
            statistic="sum",
            direction="lower",
        ),
        MetricDefinition(
            id="terminal_bench_avg_trial_duration_s",
            label="Terminal-Bench mean trial wall-clock duration",
            unit="seconds per trial",
            statistic="mean",
            direction="lower",
        ),
        *[
            MetricDefinition(
                id=f"terminal_bench_{kind}_tokens",
                label=f"Terminal-Bench {kind.replace('_', ' ')} tokens",
                unit="tokens",
                statistic="sum",
                direction="lower",
            )
            for kind in ("uncached_input", "cached_input", "output")
        ],
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
