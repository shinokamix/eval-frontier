"""Canonical metric values."""

from ..schemas.metrics import MetricDefinition

METRICS = {
    item.id: item
    for item in [
        MetricDefinition(
            id="solved", label="Solved", unit="bool", statistic="value", direction="higher"
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
            id="trial_success_rate_pct",
            label="Successful trials",
            unit="percent",
            statistic="ratio",
            direction="higher",
        ),
        MetricDefinition(
            id="reward_hack_disqualification_rate_pct",
            label="Trials disqualified for reward hacking",
            unit="percent",
            statistic="ratio",
            direction="lower",
        ),
        *[
            MetricDefinition(
                id=f"task_pass_at_{k}",
                label=f"Task pass@{k} estimate",
                unit="fraction",
                statistic="mean",
                direction="higher",
            )
            for k in range(2, 6)
        ],
        MetricDefinition(
            id="reported_cost_across_trials_usd",
            label="Reported cost across trials",
            unit="USD",
            statistic="sum",
            direction="lower",
        ),
        MetricDefinition(
            id="total_tokens_across_trials",
            label="Reported total tokens across trials",
            unit="tokens",
            statistic="sum",
            direction="lower",
        ),
        MetricDefinition(
            id="mean_trial_duration_s",
            label="Mean trial duration",
            unit="seconds per trial",
            statistic="mean",
            direction="lower",
        ),
        MetricDefinition(
            id="cached_input_tokens_across_trials",
            label="Cached input tokens across trials",
            unit="tokens",
            statistic="sum",
            direction="lower",
        ),
        MetricDefinition(
            id="output_tokens_across_trials",
            label="Output tokens across trials",
            unit="tokens",
            statistic="sum",
            direction="lower",
        ),
    ]
}
