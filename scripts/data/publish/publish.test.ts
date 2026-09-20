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
    'xbow_gpt5:codex:medium',
    'xbow_gpt5:opencode:medium',
  ]);

  const time = study.comparisons.find(
    (comparison) => comparison.id === 'quality_time',
  );

  assert.deepEqual(time?.paretoFront, [
    'xbow_gpt5:codex:medium',
    'xbow_gpt5:opencode:medium',
    'xbow_gpt5:pi:medium',
  ]);

  assert.ok(study.results.every((result) => result.effort === 'medium'));

  const m3 = research.studies.find(
    (entry) => entry.id === 'openbench_m3_gpt55_medium',
  );

  assert.equal(m3?.model.id, 'gpt-5.5');

  assert.equal(
    m3?.results.find((result) => result.harness.id === 'devin')?.effort,
    null,
  );

  assert.ok(
    m3?.results
      .filter((result) => result.harness.id !== 'devin')
      .every((result) => result.effort === 'medium'),
  );

  const m45 = research.studies.find(
    (entry) => entry.id === 'openbench_m45_gpt55_medium',
  );

  assert.deepEqual(
    m45?.results.map((result) => result.harness.id),
    ['codex', 'cursor', 'opencode', 'pi'],
  );

  assert.equal(
    m45?.results.find((result) => result.harness.id === 'pi')?.metrics
      .tokens_per_success,
    157449 / 9,
  );

  const glm47 = research.studies.find(
    (entry) => entry.id === 'openbench_m4_glm47_flash',
  );

  assert.equal(
    glm47?.results.find((result) => result.harness.id === 'pi')?.metrics
      .quality,
    4.2625 / 9,
  );
});
