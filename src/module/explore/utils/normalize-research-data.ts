import { type ResearchData, type ResearchResult } from '../types/research.ts';
import { type ScatterPoint } from '../types/scatter-point.ts';

type ResourceFamily = 'cost' | 'time' | 'tokens';

interface Observation {
  readonly efficiency: number;
  readonly quality: number;
  readonly family: ResourceFamily;
  readonly studyId: string;
}

function geometricMean(values: readonly number[]) {
  if (values.length === 0 || values.some((value) => value === 0)) return 0;

  const logMean =
    values.reduce((sum, value) => sum + Math.log(value), 0) / values.length;

  return Math.exp(logMean);
}

function getResourceFamily(metric: string): ResourceFamily | null {
  if (metric.includes('token')) return 'tokens';
  if (metric.includes('cost')) return 'cost';
  if (metric.includes('time')) return 'time';

  return null;
}

function isFinitePositive(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function groupBy<Item, Key>(
  items: readonly Item[],
  getKey: (item: Item) => Key,
) {
  const groups = new Map<Key, Item[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) ?? [];

    group.push(item);
    if (!groups.has(key)) groups.set(key, group);
  }

  return groups;
}

function getStudyPositions(observations: readonly Observation[]) {
  const byStudy = groupBy(observations, (observation) => observation.studyId);

  return [...byStudy.values()].map((studyObservations) => {
    const byFamily = groupBy(
      studyObservations,
      (observation) => observation.family,
    );

    const efficiencyByFamily = [...byFamily.values()].map((values) =>
      geometricMean(values.map((value) => value.efficiency)),
    );

    return {
      efficiency: geometricMean(efficiencyByFamily),
      quality: geometricMean(studyObservations.map((value) => value.quality)),
    };
  });
}

function normalizeResearchData(data: ResearchData): ScatterPoint[] {
  const pairs = new Map<string, Observation[]>();

  for (const study of data.studies) {
    const resultsById = new Map(
      study.results.map((result) => [result.id, result]),
    );

    for (const comparison of study.comparisons ?? []) {
      if (comparison.status !== 'primary') continue;

      const family = getResourceFamily(comparison.xMetric);
      if (!family) continue;

      const eligible = comparison.eligibleResults
        .map((id) => resultsById.get(id))
        .filter((result): result is ResearchResult => {
          if (!result?.metrics) return false;

          return (
            isFinitePositive(result.metrics[comparison.xMetric]) &&
            isFinitePositive(result.metrics[comparison.yMetric])
          );
        });

      if (eligible.length < 2) continue;

      const bestQuality = Math.max(
        ...eligible.map((result) => result.metrics?.[comparison.yMetric] ?? 0),
      );

      const bestResource = Math.min(
        ...eligible.map(
          (result) =>
            result.metrics?.[comparison.xMetric] ?? Number.POSITIVE_INFINITY,
        ),
      );

      for (const result of eligible) {
        const quality = result.metrics?.[comparison.yMetric];
        const resource = result.metrics?.[comparison.xMetric];
        if (!isFinitePositive(quality) || !isFinitePositive(resource)) continue;

        const configurationId = result.id.split(':').at(-1) ?? 'default';
        const pairId = `${study.model.id}:${result.harness.id}:${configurationId}`;
        const observations = pairs.get(pairId) ?? [];

        observations.push({
          efficiency: (100 * bestResource) / resource,
          quality: (100 * quality) / bestQuality,
          family,
          studyId: study.id,
        });

        if (!pairs.has(pairId)) pairs.set(pairId, observations);
      }
    }
  }

  return [...pairs.entries()].map(([id, observations]) => {
    const positions = getStudyPositions(observations);

    return {
      id,
      efficiency: geometricMean(
        positions.map((position) => position.efficiency),
      ),
      quality: geometricMean(positions.map((position) => position.quality)),
    };
  });
}

export { normalizeResearchData };
