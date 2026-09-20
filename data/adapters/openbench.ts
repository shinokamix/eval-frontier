interface OpenBenchExtractionOptions {
  readonly condition: string;
  readonly excludedHarnesses?: readonly string[];
  readonly unreportedEffortHarnesses?: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid ${label}`);
  }

  return value;
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }

  return value;
}

function splitModelAndEffort(model: string): {
  readonly model: string;
  readonly effort: string | null;
} {
  const match = /^(.*)-(low|medium|high|xhigh)$/u.exec(model);

  return match
    ? { model: match[1] ?? model, effort: match[2] ?? null }
    : { model, effort: null };
}

function extractOpenBench(jsonl: string, options: OpenBenchExtractionOptions) {
  const excluded = new Set(['null', ...(options.excludedHarnesses ?? [])]);
  const unreportedEffort = new Set(options.unreportedEffortHarnesses ?? []);
  const lines = jsonl.split(/\r?\n/u).filter((line) => line.trim().length > 0);

  if (lines.length === 0) throw new Error('JSONL has no data rows');

  return lines.flatMap((line, index) => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`Invalid JSON on line ${index + 1}`);
    }

    if (!isRecord(parsed)) {
      throw new Error(`JSONL row ${index + 1} is not an object`);
    }

    const harness = text(parsed.harness, 'harness');
    if (excluded.has(harness)) return [];

    if (typeof parsed.success !== 'boolean') {
      throw new Error(`Invalid success on line ${index + 1}`);
    }

    const metrics: Record<string, number> = {
      solved: parsed.success ? 1 : 0,
      score:
        parsed.score === undefined
          ? parsed.success
            ? 1
            : 0
          : finiteNumber(parsed.score, 'score'),
      wall_time_s: finiteNumber(parsed.wall_time_s, 'wall time'),
    };

    if (parsed.tokens !== null && parsed.tokens !== undefined) {
      metrics.tokens = finiteNumber(parsed.tokens, 'tokens');
    }

    const configuration = splitModelAndEffort(text(parsed.model, 'model'));

    return [
      {
        model: configuration.model,
        effort: unreportedEffort.has(harness) ? null : configuration.effort,
        harness,
        benchmark: text(parsed.task, 'task'),
        condition: options.condition,
        trial: String(finiteNumber(parsed.trial, 'trial')),
        scoring: parsed.score === undefined ? 'success' : 'partial_score',
        metrics,
      },
    ];
  });
}

export { extractOpenBench };
