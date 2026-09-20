import {
  type Crosswalk,
  type HarnessesFile,
  type MetricsFile,
  type ModelsFile,
  type ObservationRow,
  type ObservationsFile,
  type ResearchStudy,
  type StudyDefinition,
} from '../shared/schema.ts';

interface MappedRow {
  readonly model: string;
  readonly effort: string | null;
  readonly harness: string;
  readonly condition: string;
  readonly trial: string;
  readonly benchmark: string;
  readonly metrics: Readonly<Record<string, number>>;
}

function catalogLabel(
  entries: readonly { readonly id: string; readonly label: string }[],
  id: string,
  kind: string,
): string {
  const entry = entries.find((item) => item.id === id);

  if (!entry) {
    throw new Error(`Unknown canonical ${kind}: ${id}`);
  }

  return entry.label;
}

function mappedId(
  table: Readonly<Record<string, string>>,
  native: string,
  kind: string,
): string {
  const id = table[native];

  if (id === undefined) {
    throw new Error(`Unmapped ${kind}: ${native}`);
  }

  return id;
}

function remapMetricKeys(
  metrics: Readonly<Record<string, number>>,
  table: Readonly<Record<string, string>>,
): Record<string, number> {
  const remapped: Record<string, number> = {};

  for (const [native, value] of Object.entries(metrics)) {
    remapped[mappedId(table, native, 'metric')] = value;
  }

  return remapped;
}

function mapRows(
  observations: ObservationsFile,
  crosswalk: Crosswalk,
): MappedRow[] {
  return observations.rows.map((row: ObservationRow) => ({
    model: mappedId(crosswalk.models, row.native.model, 'model'),
    effort: row.native.effort,
    harness: mappedId(crosswalk.harnesses, row.native.harness, 'harness'),
    condition: row.native.condition,
    trial: row.native.trial,
    benchmark: row.native.benchmark,
    metrics: remapMetricKeys(row.native.metrics, crosswalk.metrics),
  }));
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot take the median of no values');
  }

  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? 0;
  }

  const low = sorted[middle - 1];
  const high = sorted[middle];

  if (low === undefined || high === undefined) {
    throw new Error('Median lookup failed');
  }

  return (low + high) / 2;
}

function metricValues(rows: readonly MappedRow[], name: string): number[] {
  return rows.map((row) => {
    const value = row.metrics[name];

    if (value === undefined) {
      throw new Error(`Missing metric ${name}`);
    }

    return value;
  });
}

function successes(rows: readonly MappedRow[]): number {
  return rows.filter((row) => row.metrics.solved === 1).length;
}

function aggregateMetric(
  kind: 'rate' | 'mean' | 'median' | 'sum_per_success',
  source: string,
  rows: readonly MappedRow[],
): number | undefined {
  if (kind === 'rate' || kind === 'mean') {
    const values = metricValues(rows, source);

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  if (kind === 'median') {
    return median(metricValues(rows, source));
  }

  const successCount = successes(rows);

  if (successCount === 0) return undefined;

  return (
    metricValues(rows, source).reduce((sum, value) => sum + value, 0) /
    successCount
  );
}

function groupByConfiguration(
  rows: readonly MappedRow[],
): Map<string, MappedRow[]> {
  const groups = new Map<string, MappedRow[]>();

  for (const row of rows) {
    const key = JSON.stringify([row.harness, row.effort]);
    const group = groups.get(key) ?? [];

    group.push(row);
    if (!groups.has(key)) groups.set(key, group);
  }

  return groups;
}

function dominates(
  left: Readonly<Record<string, number>>,
  right: Readonly<Record<string, number>>,
  xMetric: string,
  yMetric: string,
): boolean {
  const leftX = left[xMetric];
  const leftY = left[yMetric];
  const rightX = right[xMetric];
  const rightY = right[yMetric];

  if (
    leftX === undefined ||
    leftY === undefined ||
    rightX === undefined ||
    rightY === undefined
  ) {
    return false;
  }

  const betterOrEqualQuality = leftY >= rightY;
  const betterOrEqualResource = leftX <= rightX;
  const strict = leftY > rightY || leftX < rightX;

  return betterOrEqualQuality && betterOrEqualResource && strict;
}

function paretoFront(
  results: readonly {
    readonly id: string;
    readonly metrics: Readonly<Record<string, number>>;
  }[],
  xMetric: string,
  yMetric: string,
): string[] {
  const eligible = results.filter((result) => {
    const x = result.metrics[xMetric];
    const y = result.metrics[yMetric];

    return x !== undefined && y !== undefined;
  });

  return eligible
    .filter(
      (result) =>
        !eligible.some(
          (other) =>
            other.id !== result.id &&
            dominates(other.metrics, result.metrics, xMetric, yMetric),
        ),
    )
    .map((result) => result.id);
}

function harmonizeStudy(
  definition: StudyDefinition,
  observations: ObservationsFile,
  crosswalk: Crosswalk,
  models: ModelsFile,
  harnesses: HarnessesFile,
  metricsCatalog: MetricsFile,
  sourceUrl: string,
): ResearchStudy {
  if (definition.model !== definition.select.model) {
    throw new Error(`Study ${definition.id} model does not match its select`);
  }

  catalogLabel(models.models, definition.model, 'model');

  for (const metric of definition.resultMetrics) {
    catalogLabel(metricsCatalog.metrics, metric.id, 'metric');
  }

  for (const comparison of definition.comparisons) {
    catalogLabel(metricsCatalog.metrics, comparison.xMetric, 'metric');
    catalogLabel(metricsCatalog.metrics, comparison.yMetric, 'metric');
  }

  const selected = mapRows(observations, crosswalk).filter(
    (row) =>
      row.model === definition.select.model &&
      row.condition === definition.select.native.condition,
  );

  if (selected.length === 0) {
    throw new Error(`Study ${definition.id} selected no rows`);
  }

  const results = [...groupByConfiguration(selected).values()]
    .toSorted((left, right) => {
      const harnessOrder = (left[0]?.harness ?? '').localeCompare(
        right[0]?.harness ?? '',
      );

      if (harnessOrder !== 0) return harnessOrder;

      return (left[0]?.effort ?? '').localeCompare(right[0]?.effort ?? '');
    })
    .map((rows) => {
      const harnessId = rows[0]?.harness;
      const effort = rows[0]?.effort ?? null;

      if (!harnessId) throw new Error('Cannot harmonize an empty group');

      const metrics: Record<string, number> = {};

      for (const metric of definition.resultMetrics) {
        const value = aggregateMetric(metric.kind, metric.source, rows);

        if (value !== undefined) metrics[metric.id] = value;
      }

      return {
        id: `${definition.id}:${harnessId}:${effort ?? 'unknown'}`,
        effort,
        harness: {
          id: harnessId,
          name: catalogLabel(harnesses.harnesses, harnessId, 'harness'),
        },
        metrics,
        sample: {
          tasks: new Set(rows.map((row) => row.benchmark)).size,
          trialsPerTask: new Set(rows.map((row) => row.trial)).size,
          evaluatedCells: rows.length,
          successfulAttempts: successes(rows),
        },
        caveats: definition.caveats,
      };
    });

  const comparisons = definition.comparisons.map((comparison) => {
    const eligibleResults = results
      .filter((result) => {
        const x = result.metrics[comparison.xMetric];
        const y = result.metrics[comparison.yMetric];

        return x !== undefined && y !== undefined;
      })
      .map((result) => result.id);

    const status =
      eligibleResults.length < 2
        ? ('insufficient_data' as const)
        : comparison.status;

    return {
      id: comparison.id,
      status,
      xMetric: comparison.xMetric,
      yMetric: comparison.yMetric,
      eligibleResults,
      paretoFront:
        status === 'insufficient_data'
          ? []
          : paretoFront(results, comparison.xMetric, comparison.yMetric),
    };
  });

  return {
    id: definition.id,
    title: definition.title,
    model: {
      id: definition.model,
      label: catalogLabel(models.models, definition.model, 'model'),
    },
    benchmark: definition.benchmark,
    qualityMetric: definition.qualityMetric,
    source: {
      id: definition.sourceId,
      url: sourceUrl,
      evidenceGrade: definition.evidenceGrade,
    },
    results,
    comparisons,
  };
}

export { harmonizeStudy, median, remapMetricKeys };
