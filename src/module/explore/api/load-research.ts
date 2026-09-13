import {
  type ResearchComparison,
  type ResearchData,
  type ResearchResult,
  type ResearchStudy,
} from '../types/research.ts';
import { normalizeResearchData } from '../utils/normalize-research-data.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasId(
  value: unknown,
): value is Record<string, unknown> & { id: string } {
  return isRecord(value) && typeof value.id === 'string';
}

function isResult(value: unknown): value is ResearchResult {
  return (
    isRecord(value) &&
    hasId(value) &&
    hasId(value.harness) &&
    (value.metrics === undefined ||
      (isRecord(value.metrics) &&
        Object.values(value.metrics).every(
          (metric) => typeof metric === 'number' && Number.isFinite(metric),
        )))
  );
}

function isComparison(value: unknown): value is ResearchComparison {
  return (
    isRecord(value) &&
    (value.status === 'primary' ||
      value.status === 'sensitivity' ||
      value.status === 'insufficient_data') &&
    typeof value.xMetric === 'string' &&
    typeof value.yMetric === 'string' &&
    Array.isArray(value.eligibleResults) &&
    value.eligibleResults.every((id: unknown) => typeof id === 'string')
  );
}

function isStudy(value: unknown): value is ResearchStudy {
  return (
    isRecord(value) &&
    hasId(value) &&
    hasId(value.model) &&
    Array.isArray(value.results) &&
    value.results.every(isResult) &&
    (value.comparisons === undefined ||
      (Array.isArray(value.comparisons) &&
        value.comparisons.every(isComparison)))
  );
}

function isResearchData(value: unknown): value is ResearchData {
  return (
    isRecord(value) &&
    Array.isArray(value.studies) &&
    value.studies.every(isStudy)
  );
}

async function loadResearchData() {
  const response = await fetch('/data/research.json');

  if (!response.ok) {
    throw new Error(`Research data returned ${response.status}`);
  }

  const research: unknown = await response.json();

  if (!isResearchData(research)) {
    throw new Error('Research data is invalid');
  }

  return normalizeResearchData(research);
}

export { loadResearchData };
