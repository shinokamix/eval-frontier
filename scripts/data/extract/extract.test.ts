import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { readJson } from '../shared/json.ts';
import { observationsFileSchema } from '../shared/schema.ts';
import { extractSource } from './index.ts';

const dataDirectory = fileURLToPath(new URL('../../../data/', import.meta.url));
const krodaId = 'kroda-coding-agent-baselines';

const krodaSnapshot =
  '72f5c501feb7da5054ceccea20376853c5a97809d42d613f348d0e8c76d247c4';

await test('extract writes kroda observations from the pinned snapshot', async () => {
  const output = await extractSource(dataDirectory, krodaId, krodaSnapshot);
  const observations = observationsFileSchema.parse(await readJson(output));

  assert.equal(observations.sourceId, krodaId);
  assert.equal(observations.snapshotId, krodaSnapshot);
  assert.equal(observations.rows.length, 1456);
  assert.equal(observations.rows[0]?.native.harness, 'codex');
  assert.equal(observations.rows[0]?.native.metrics.solved, 1);
});
