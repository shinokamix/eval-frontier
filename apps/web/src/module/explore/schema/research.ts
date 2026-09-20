import { z } from 'zod';

const researchResultSchema = z.object({
  id: z.string(),
  effort: z.string().nullable(),
  harness: z.object({ id: z.string(), name: z.string().optional() }),
  metrics: z.record(z.string(), z.number().finite()).optional(),
});

const researchComparisonSchema = z.object({
  status: z.enum(['insufficient_data', 'primary', 'sensitivity']),
  xMetric: z.string(),
  yMetric: z.string(),
  eligibleResults: z.array(z.string()),
});

const researchStudySchema = z.object({
  id: z.string(),
  model: z.object({ id: z.string(), label: z.string().optional() }),
  results: z.array(researchResultSchema),
  comparisons: z.array(researchComparisonSchema).optional(),
});

const researchDataSchema = z.object({ studies: z.array(researchStudySchema) });

type ResearchComparison = z.infer<typeof researchComparisonSchema>;
type ResearchData = z.infer<typeof researchDataSchema>;
type ResearchResult = z.infer<typeof researchResultSchema>;
type ResearchStudy = z.infer<typeof researchStudySchema>;

export { researchDataSchema };
export type { ResearchComparison, ResearchData, ResearchResult, ResearchStudy };
