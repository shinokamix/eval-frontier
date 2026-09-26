import { researchDataSchema } from '../schema/research';

async function loadResearchData() {
  const response = await fetch('/data/research.json');

  if (!response.ok) {
    throw new Error(`Research data returned ${response.status}`);
  }

  const parsed = researchDataSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error('Research data is invalid');
  }

  return parsed.data;
}

export { loadResearchData };
