import { parse } from 'csv-parse/sync';

const artifactPath = 'per_challenge_results.csv';

const metricColumns = [
  'solved',
  'duration_seconds',
  'cost_usd',
  'total_tokens',
  'input_tokens',
  'cached_input_tokens',
  'output_tokens',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid ${label}`);
  }

  return value;
}

function optionalNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value !== 'string') {
    throw new Error(`Invalid ${label}`);
  }

  if (value.trim().length === 0) return undefined;

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label}`);
  }

  return parsed;
}

function extract(csv: string) {
  const records: unknown = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('CSV has no data rows');
  }

  return records.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error('CSV row is not an object');
    }

    const metrics: Record<string, number> = {};

    for (const column of metricColumns) {
      const value = optionalNumber(entry[column], column);

      if (value !== undefined) metrics[column] = value;
    }

    if (metrics.solved === undefined) {
      throw new Error('CSV row is missing solved');
    }

    return {
      model: text(entry.model, 'model'),
      harness: text(entry.agent_cli, 'harness'),
      benchmark: text(entry.benchmark_id, 'benchmark'),
      condition: text(entry.condition, 'condition'),
      trial: text(entry.pass_index, 'trial'),
      scoring: 'solved',
      metrics,
    };
  });
}

export { artifactPath, extract };
