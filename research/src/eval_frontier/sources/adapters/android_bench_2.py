"""Extract Android Bench 2.0 aggregates from the official leaderboard HTML."""

from __future__ import annotations

import math
import re
from html import unescape
from typing import Any

TABLE_START = '<div class="devsite-table-wrapper android-bench-score-table">'
ROW_START = '<tr class="android-bench-score-table-row">'
CELL = re.compile(r"<td(?:\s[^>]*)?>(.*?)</td>", re.DOTALL)
TAG = re.compile(r"<[^>]+>")
MODEL = re.compile(r'<span class="android-bench-score-model-name">(.*?)</span>', re.DOTALL)
AGENT = re.compile(r'<span class="android-bench-score-agent">(.*?)</span>', re.DOTALL)
SCORE = re.compile(r'<b class="android-bench-score-value">(.*?)</b>', re.DOTALL)
INTERVAL = re.compile(r"(\d+(?:\.\d+)?)\s*—\s*(\d+(?:\.\d+)?)")


def _text(fragment: str) -> str:
    return " ".join(unescape(TAG.sub(" ", fragment)).split())


def _match(pattern: re.Pattern[str], value: str, field: str) -> str:
    match = pattern.search(value)
    if match is None:
        raise ValueError(f"Missing Android Bench 2.0 {field}")
    return _text(match.group(1))


def extract(content: str) -> list[dict[str, Any]]:
    if content.count(TABLE_START) < 1:
        raise ValueError("Missing Android Bench 2.0 leaderboard table")
    start = content.index(TABLE_START)
    end = content.find("</table>", start)
    if end < 0:
        raise ValueError("Android Bench 2.0 table is incomplete")
    table = content[start:end]
    if "Average percentage of 30 tasks successfully resolved" not in table:
        raise ValueError("First leaderboard table is not Android Bench 2.0")
    matches = list(re.finditer(re.escape(ROW_START), table))
    if not matches:
        raise ValueError("Android Bench 2.0 table has no results")

    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for match in matches:
        row_html = table[match.end() :].split("</tr>", 1)[0]
        cells = CELL.findall(row_html)
        if len(cells) != 6:
            raise ValueError("Unexpected Android Bench 2.0 table columns")
        model = _match(MODEL, cells[0], "model")
        agent = _match(AGENT, cells[0], "agent")
        if (model, agent) in seen:
            raise ValueError(f"Duplicate Android Bench 2.0 result: {model}/{agent}")
        seen.add((model, agent))

        interval = INTERVAL.fullmatch(_text(cells[2]))
        if interval is None:
            raise ValueError(f"Invalid Android Bench 2.0 interval: {model}/{agent}")
        lower, upper = map(float, interval.groups())
        pass_rate = float(_match(SCORE, cells[1], "pass rate"))
        completion_rate = float(_match(SCORE, cells[3], "completion rate"))
        latency_hours = float(_text(cells[4]))
        cost_usd = float(_text(cells[5]).removeprefix("$"))
        if (
            not all(
                math.isfinite(v)
                for v in (lower, upper, pass_rate, completion_rate, latency_hours, cost_usd)
            )
            or not 0 <= lower <= pass_rate <= upper <= 100
            or not 0 <= completion_rate <= 100
            or latency_hours < 0
            or cost_usd < 0
        ):
            raise ValueError(f"Out-of-range Android Bench 2.0 result: {model}/{agent}")

        rows.append(
            {
                "_source_line": content.count("\n", 0, start + match.start()) + 1,
                "model": model,
                "harness": agent,
                "benchmark": "android-bench",
                "benchmark_version": "2.0",
                "aggregate": True,
                "sample_sizes": {"pass_rate_pct": 150},
                "interval_lowers": {"pass_rate_pct": lower},
                "interval_uppers": {"pass_rate_pct": upper},
                "metrics": {
                    "pass_rate_pct": pass_rate,
                    "completion_rate_pct": completion_rate,
                    "average_latency_s": latency_hours * 3600,
                    "average_cost_usd": cost_usd,
                },
            }
        )
        dialog = re.search(r'data-modal-dialog-id="([^"]+)"', row_html)
        if dialog is None:
            raise ValueError(f"Missing Android model card: {model}")
        card_start = content.index(f' id="{dialog[1]}"')
        table_start = content.index('<table class="android-bench-llm-modal-table">', card_start)
        table_end = content.index("</table>", table_start)
        task_matches = list(
            re.finditer(
                r'<tr class="android-bench-llm-modal-table-row"[^>]*>(.*?)</tr>',
                content[table_start:table_end],
                re.DOTALL,
            )
        )
        task_names = set()
        passed_total = 0
        for task_match in task_matches:
            task_cells = CELL.findall(task_match[1])
            task = _text(task_cells[0])
            counts = re.fullmatch(r"(\d+)/(\d+)", _text(task_cells[3]))
            if counts is None or int(counts[2]) != 5 or not 0 <= int(counts[1]) <= 5:
                raise ValueError(f"Invalid Android task counts: {model}/{task}")
            if task in task_names:
                raise ValueError(f"Duplicate Android task: {model}/{task}")
            task_names.add(task)
            passes = int(counts[1])
            passed_total += passes
            rows.append(
                {
                    "_source_line": content.count("\n", 0, table_start + task_match.start()) + 1,
                    "model": model,
                    "harness": agent,
                    "benchmark": "android-bench",
                    "benchmark_version": "2.0",
                    "aggregate": True,
                    "task_id": task,
                    "sample_sizes": {"pass_rate_pct": 5},
                    "metrics": {"pass_rate_pct": 100 * passes / 5},
                }
            )
        if len(task_names) != 30 or abs(100 * passed_total / 150 - pass_rate) > 0.051:
            raise ValueError(f"Android task counts disagree with leaderboard: {model}")
    return rows
