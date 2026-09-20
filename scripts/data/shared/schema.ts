import { z } from 'zod';

const finiteNumber = z.number().finite();

const observationsNativeSchema = z.object({
  model: z.string().min(1),
  effort: z.string().min(1).nullable(),
  harness: z.string().min(1),
  benchmark: z.string().min(1),
  condition: z.string().min(1),
  trial: z.string().min(1),
  scoring: z.string().min(1),
  metrics: z.record(z.string(), finiteNumber),
});

const observationRowSchema = z.object({
  provenance: z.object({
    path: z.string().min(1),
    row: z.number().int().positive(),
  }),
  native: observationsNativeSchema,
});

const observationsFileSchema = z.object({
  schemaVersion: z.literal(2),
  sourceId: z.string().min(1),
  snapshotId: z.string().regex(/^[a-f0-9]{64}$/),
  artifact: z.object({
    path: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  rows: z.array(observationRowSchema).min(1),
});

const crosswalkSchema = z.object({
  schemaVersion: z.literal(1),
  models: z.record(z.string(), z.string().min(1)),
  harnesses: z.record(z.string(), z.string().min(1)),
  metrics: z.record(z.string(), z.string().min(1)),
});

const catalogEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const modelsFileSchema = z.object({
  schemaVersion: z.literal(1),
  models: z.array(catalogEntrySchema).min(1),
});

const harnessesFileSchema = z.object({
  schemaVersion: z.literal(1),
  harnesses: z.array(catalogEntrySchema).min(1),
});

const metricsFileSchema = z.object({
  schemaVersion: z.literal(1),
  metrics: z.array(catalogEntrySchema).min(1),
});

const pinsFileSchema = z.object({
  schemaVersion: z.literal(1),
  sources: z.record(z.string().min(1), z.string().regex(/^[a-f0-9]{64}$/)),
});

const resultMetricSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['rate', 'mean', 'median', 'sum_per_success']),
  source: z.string().min(1),
});

const studyComparisonSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['primary', 'sensitivity']),
  xMetric: z.string().min(1),
  yMetric: z.string().min(1),
});

const studyDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  model: z.string().min(1),
  benchmark: z.string().min(1),
  sourceId: z.string().min(1),
  evidenceGrade: z.string().min(1),
  select: z.object({
    model: z.string().min(1),
    native: z.object({ condition: z.string().min(1) }),
  }),
  qualityMetric: z.string().min(1),
  resultMetrics: z.array(resultMetricSchema).min(1),
  comparisons: z.array(studyComparisonSchema).min(1),
  caveats: z.array(z.string().min(1)),
});

const studiesFileSchema = z.object({
  schemaVersion: z.literal(2),
  studies: z.array(studyDefinitionSchema).min(1),
});

const researchHarnessSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const researchResultSchema = z.object({
  id: z.string().min(1),
  effort: z.string().min(1).nullable(),
  harness: researchHarnessSchema,
  metrics: z.record(z.string(), finiteNumber),
  sample: z.object({
    tasks: z.number().int().positive(),
    trialsPerTask: z.number().int().positive(),
    evaluatedCells: z.number().int().positive(),
    successfulAttempts: z.number().int().nonnegative(),
  }),
  caveats: z.array(z.string().min(1)),
});

const researchComparisonSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['insufficient_data', 'primary', 'sensitivity']),
  xMetric: z.string().min(1),
  yMetric: z.string().min(1),
  eligibleResults: z.array(z.string().min(1)),
  paretoFront: z.array(z.string().min(1)),
});

const researchStudySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  model: z.object({ id: z.string().min(1), label: z.string().min(1) }),
  benchmark: z.string().min(1),
  qualityMetric: z.string().min(1),
  source: z.object({
    id: z.string().min(1),
    url: z.string().url(),
    evidenceGrade: z.string().min(1),
  }),
  results: z.array(researchResultSchema).min(1),
  comparisons: z.array(researchComparisonSchema).min(1),
});

const researchDataSchema = z.object({
  schemaVersion: z.literal(2),
  studies: z.array(researchStudySchema),
});

export {
  crosswalkSchema,
  harnessesFileSchema,
  metricsFileSchema,
  modelsFileSchema,
  observationRowSchema,
  observationsFileSchema,
  pinsFileSchema,
  researchDataSchema,
  studiesFileSchema,
  studyDefinitionSchema,
};

export type Crosswalk = z.infer<typeof crosswalkSchema>;
export type HarnessesFile = z.infer<typeof harnessesFileSchema>;
export type MetricsFile = z.infer<typeof metricsFileSchema>;
export type ModelsFile = z.infer<typeof modelsFileSchema>;
export type ObservationRow = z.infer<typeof observationRowSchema>;
export type ObservationsFile = z.infer<typeof observationsFileSchema>;
export type PinsFile = z.infer<typeof pinsFileSchema>;
export type ResearchData = z.infer<typeof researchDataSchema>;
export type ResearchStudy = z.infer<typeof researchStudySchema>;
export type StudiesFile = z.infer<typeof studiesFileSchema>;
export type StudyDefinition = z.infer<typeof studyDefinitionSchema>;
