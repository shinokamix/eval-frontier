interface ResearchResult {
  readonly id: string;
  readonly harness: { readonly id: string; readonly name?: string };
  readonly metrics?: Readonly<Record<string, number | undefined>>;
}

interface ResearchComparison {
  readonly status: 'insufficient_data' | 'primary' | 'sensitivity';
  readonly xMetric: string;
  readonly yMetric: string;
  readonly eligibleResults: readonly string[];
}

interface ResearchStudy {
  readonly id: string;
  readonly model: { readonly id: string; readonly label?: string };
  readonly results: readonly ResearchResult[];
  readonly comparisons?: readonly ResearchComparison[];
}

interface ResearchData {
  readonly studies: readonly ResearchStudy[];
}

export type { ResearchComparison, ResearchData, ResearchResult, ResearchStudy };
