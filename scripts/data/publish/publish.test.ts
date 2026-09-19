import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { readJson } from '../shared/json.ts';
import { researchDataSchema } from '../shared/schema.ts';
import { publishResearch } from './index.ts';

const dataDirectory = fileURLToPath(new URL('../../../data/', import.meta.url));

await test('publish writes the kroda gpt-5 study', async () => {
  const output = await publishResearch(dataDirectory);
  const research = researchDataSchema.parse(await readJson(output));
  const study = research.studies.find((entry) => entry.id === 'xbow_gpt5');

  assert.equal(
    output,
    fileURLToPath(
      new URL('../../../public/data/research.json', import.meta.url),
    ),
  );

  assert.ok(study);
  assert.equal(study.results.length, 3);

  const byHarness = Object.fromEntries(
    study.results.map((result) => [result.harness.id, result]),
  );

  assert.equal(byHarness.codex?.metrics.quality, 140 / 208);
  assert.equal(byHarness.opencode?.metrics.quality, 111 / 208);
  assert.equal(byHarness.pi?.metrics.quality, 104 / 208);
  assert.equal(byHarness.codex?.metrics.time_median_s, (163.78 + 166.8) / 2);
  assert.equal(byHarness.opencode?.metrics.time_median_s, 118.245);
  assert.equal(byHarness.pi?.metrics.time_median_s, 82.75);

  const cost = study.comparisons.find(
    (comparison) => comparison.id === 'quality_cost',
  );

  assert.deepEqual(cost?.paretoFront, [
    'xbow_gpt5:codex:default',
    'xbow_gpt5:opencode:default',
  ]);

  const time = study.comparisons.find(
    (comparison) => comparison.id === 'quality_time',
  );

  assert.deepEqual(time?.paretoFront, [
    'xbow_gpt5:codex:default',
    'xbow_gpt5:opencode:default',
    'xbow_gpt5:pi:default',
  ]);
});
