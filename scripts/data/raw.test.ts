import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { captureSource, sha256, verifySnapshot, verifySources } from './raw.ts';

async function temporary(t: TestContext): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'raw-source-test-'));

  t.after(() => rm(directory, { recursive: true, force: true }));

  return directory;
}

async function addSource(directory: string): Promise<void> {
  const sourceDirectory = join(directory, 'sources', 'example');

  await import('node:fs/promises').then(({ mkdir }) =>
    mkdir(sourceDirectory, { recursive: true }),
  );

  await writeFile(
    join(sourceDirectory, 'source.json'),
    JSON.stringify({
      schemaVersion: 1,
      id: 'example',
      title: 'Example source',
      canonicalUrl: 'https://example.org',
      license: 'CC0-1.0',
      redistribution: 'allowed',
      artifacts: [
        {
          path: 'results.json',
          role: 'results',
          url: 'https://example.org/results.json',
        },
        {
          path: 'paper.pdf',
          role: 'methodology',
          url: 'https://example.org/paper.pdf',
        },
      ],
    }),
  );
}

function fetchFixture(url: string): Promise<Response> {
  const body = url.endsWith('.pdf') ? 'pdf bytes' : '{"score":1}';

  const mediaType = url.endsWith('.pdf')
    ? 'application/pdf'
    : 'application/json';

  return Promise.resolve(
    new Response(body, { headers: { 'content-type': mediaType } }),
  );
}

await test('capture preserves response bytes and writes a verifiable manifest', async (t) => {
  const directory = await temporary(t);
  await addSource(directory);

  const snapshot = await captureSource(directory, 'example', {
    fetch: fetchFixture,
    now: () => new Date('2026-09-17T18:00:00Z'),
  });

  const manifest = await verifySnapshot(directory, 'example', snapshot);

  const snapshotDirectory = join(
    directory,
    'sources',
    'example',
    'raw',
    snapshot,
  );

  assert.equal(manifest.capturedAt, '2026-09-17T18:00:00.000Z');
  assert.equal(manifest.artifacts.length, 2);

  assert.equal(
    await readFile(
      join(snapshotDirectory, 'artifacts', 'results.json'),
      'utf8',
    ),
    '{"score":1}',
  );

  assert.equal(
    manifest.artifacts[0].sha256,
    sha256(Buffer.from('{"score":1}')),
  );

  assert.equal(await verifySources(directory), 1);
});

await test('capturing the same bytes retains one snapshot', async (t) => {
  const directory = await temporary(t);
  await addSource(directory);

  const first = await captureSource(directory, 'example', {
    fetch: fetchFixture,
    now: () => new Date('2026-09-17T18:00:00Z'),
  });

  const second = await captureSource(directory, 'example', {
    fetch: fetchFixture,
    now: () => new Date('2027-01-01T00:00:00Z'),
  });

  const snapshots = await readdir(join(directory, 'sources', 'example', 'raw'));
  const manifest = await verifySnapshot(directory, 'example', first);

  assert.equal(first, second);
  assert.deepEqual(snapshots, [first]);
  assert.equal(manifest.capturedAt, '2026-09-17T18:00:00.000Z');
});

await test('verification rejects changed artifact bytes', async (t) => {
  const directory = await temporary(t);
  await addSource(directory);

  const snapshot = await captureSource(directory, 'example', {
    fetch: fetchFixture,
  });

  await writeFile(
    join(
      directory,
      'sources',
      'example',
      'raw',
      snapshot,
      'artifacts',
      'results.json',
    ),
    'changed',
  );

  await assert.rejects(
    verifySnapshot(directory, 'example', snapshot),
    /checksum mismatch/,
  );
});

await test('capture rejects failed requests and unsafe paths', async (t) => {
  const directory = await temporary(t);
  await addSource(directory);

  await assert.rejects(
    captureSource(directory, 'example', {
      fetch: () => Promise.resolve(new Response('missing', { status: 404 })),
    }),
    /HTTP 404/,
  );

  const path = join(directory, 'sources', 'example', 'source.json');
  const source: unknown = JSON.parse(await readFile(path, 'utf8'));
  assert.ok(source !== null && typeof source === 'object');
  assert.ok('artifacts' in source && Array.isArray(source.artifacts));
  source.artifacts[0].path = '../outside';
  await writeFile(path, JSON.stringify(source));

  await assert.rejects(
    captureSource(directory, 'example'),
    /Invalid artifact path/,
  );
});
