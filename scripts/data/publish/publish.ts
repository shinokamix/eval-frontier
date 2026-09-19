import { join } from 'node:path';

import { readSource } from '../capture/index.ts';
import { extractSource } from '../extract/index.ts';
import { harmonizeStudy } from '../harmonize/index.ts';
import { readJson, writeJson } from '../shared/json.ts';
import {
  crosswalkSchema,
  harnessesFileSchema,
  metricsFileSchema,
  modelsFileSchema,
  observationsFileSchema,
  pinsFileSchema,
  researchDataSchema,
  studiesFileSchema,
} from '../shared/schema.ts';

async function publishResearch(directory: string) {
  const pins = pinsFileSchema.parse(
    await readJson(join(directory, 'canonical', 'pins.json')),
  );

  if (Object.keys(pins.sources).length === 0) {
    throw new Error('No pinned sources');
  }

  const studiesFile = studiesFileSchema.parse(
    await readJson(join(directory, 'canonical', 'studies.json')),
  );

  const models = modelsFileSchema.parse(
    await readJson(join(directory, 'canonical', 'models.json')),
  );

  const harnesses = harnessesFileSchema.parse(
    await readJson(join(directory, 'canonical', 'harnesses.json')),
  );

  const metrics = metricsFileSchema.parse(
    await readJson(join(directory, 'canonical', 'metrics.json')),
  );

  const observationsBySource = new Map<
    string,
    ReturnType<typeof observationsFileSchema.parse>
  >();

  for (const [sourceId, snapshotId] of Object.entries(pins.sources)) {
    await extractSource(directory, sourceId, snapshotId);

    const observations = observationsFileSchema.parse(
      await readJson(
        join(
          directory,
          'sources',
          sourceId,
          'extracted',
          snapshotId,
          'observations.json',
        ),
      ),
    );

    observationsBySource.set(sourceId, observations);
  }

  const studies = [];

  for (const definition of studiesFile.studies) {
    const observations = observationsBySource.get(definition.sourceId);

    if (!observations) {
      throw new Error(
        `Study ${definition.id} source ${definition.sourceId} is not pinned`,
      );
    }

    const source = await readSource(directory, definition.sourceId);

    const crosswalk = crosswalkSchema.parse(
      await readJson(
        join(directory, 'sources', definition.sourceId, 'crosswalk.json'),
      ),
    );

    studies.push(
      harmonizeStudy(
        definition,
        observations,
        crosswalk,
        models,
        harnesses,
        metrics,
        source.canonicalUrl,
      ),
    );
  }

  const research = researchDataSchema.parse({ schemaVersion: 1, studies });

  const output = join(directory, '..', 'public', 'data', 'research.json');

  await writeJson(output, research);

  return output;
}

export { publishResearch };
