import { type ResearchData, type ResearchResult } from '../types/research';
import { type ScatterPoint } from '../types/scatter-point';

type ResourceFamily = 'cost' | 'time' | 'tokens';

interface Observation {
  readonly efficiency: number;
  readonly quality: number;
  readonly family: ResourceFamily;
  readonly studyId: string;
}

interface PairObservations {
  readonly model: string;
  readonly effort: string | null;
  readonly harness: string;
  readonly observations: Observation[];
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
  const pairs = new Map<string, PairObservations>();

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

        const effort = result.effort ?? 'unknown';
        const pairId = `${study.model.id}:${result.harness.id}:${effort}`;
        let pair = pairs.get(pairId);

        if (!pair) {
          pair = {
            model: study.model.label ?? study.model.id,
            effort: result.effort,
            harness: result.harness.name ?? result.harness.id,
            observations: [],
          };

          pairs.set(pairId, pair);
        }

        pair.observations.push({
          efficiency: (100 * bestResource) / resource,
          quality: (100 * quality) / bestQuality,
          family,
          studyId: study.id,
        });
      }
    }
  }

  return [...pairs.entries()].map(([id, pair]) => {
    const positions = getStudyPositions(pair.observations);

    return {
      id,
      model: pair.model,
      effort: pair.effort,
      harness: pair.harness,
      efficiency: geometricMean(
        positions.map((position) => position.efficiency),
      ),
      quality: geometricMean(positions.map((position) => position.quality)),
    };
  });
}

export { normalizeResearchData };
