import { z } from 'zod';

// Coordinates computed by the research pipeline, relative to a reference
// system: cost as a ratio, quality in percentage points.
const researchDataSchema = z.object({
  points: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      relativeCost: z.number().positive(),
      qualityDifference: z.number(),
    }),
  ),
});

type ResearchData = z.infer<typeof researchDataSchema>;

export { researchDataSchema };
export type { ResearchData };
