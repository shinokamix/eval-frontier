import assert from 'node:assert/strict';
import test from 'node:test';

import { remapMetricKeys } from './index.ts';

await test('harmonize fails on an unmapped metric name', () => {
  assert.throws(
    () => remapMetricKeys({ tokens: 10 }, { cost_usd: 'cost_usd' }),
    /Unmapped metric: tokens/,
  );
});
