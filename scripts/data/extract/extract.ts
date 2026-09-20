import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { readSource, sha256, verifySnapshot } from '../capture/index.ts';
import { readJson, writeJson } from '../shared/json.ts';
import { observationsFileSchema, pinsFileSchema } from '../shared/schema.ts';

interface SourceAdapter {
  readonly artifactPath: string;
  extract: (csv: string) => unknown;
}

function isAdapter(value: unknown): value is SourceAdapter {
  if (value === null || typeof value !== 'object') return false;

  const adapter = value as { artifactPath?: unknown; extract?: unknown };

  return (
    typeof adapter.artifactPath === 'string' &&
    adapter.artifactPath.length > 0 &&
    typeof adapter.extract === 'function'
  );
}

async function loadAdapter(
  directory: string,
  id: string,
): Promise<SourceAdapter> {
  const adapterPath = join(directory, 'sources', id, 'extract.ts');
  const loaded: unknown = await import(pathToFileURL(adapterPath).href);

  if (!isAdapter(loaded)) {
    throw new Error(`Invalid extract adapter: ${id}`);
  }

  return loaded;
}

async function extractSource(
  directory: string,
  id: string,
  snapshotId: string,
): Promise<string> {
  const source = await readSource(directory, id);
  const manifest = await verifySnapshot(directory, source.id, snapshotId);
  const adapter = await loadAdapter(directory, source.id);
  const artifactPath = `artifacts/${adapter.artifactPath}`;

  const captured = manifest.artifacts.find(
    (artifact) => artifact.path === artifactPath,
  );

  if (!captured) {
    throw new Error(
      `Adapter artifact is missing from snapshot: ${artifactPath}`,
    );
  }

  const bytes = await readFile(
    join(directory, 'sources', source.id, 'raw', snapshotId, artifactPath),
  );

  if (sha256(bytes) !== captured.sha256) {
    throw new Error(`Artifact checksum mismatch: ${artifactPath}`);
  }

  const natives = adapter.extract(new TextDecoder().decode(bytes));

  if (!Array.isArray(natives) || natives.length === 0) {
    throw new Error('Extract adapter returned no rows');
  }

  const observations = observationsFileSchema.parse({
    schemaVersion: 2,
    sourceId: source.id,
    snapshotId,
    artifact: { path: artifactPath, sha256: captured.sha256 },
    rows: natives.map((native, index) => ({
      provenance: { path: artifactPath, row: index + 2 },
      native,
    })),
  });

  const output = join(
    directory,
    'sources',
    source.id,
    'extracted',
    snapshotId,
    'observations.json',
  );

  await writeJson(output, observations);

  return output;
}

async function extractPinnedSource(
  directory: string,
  id: string,
): Promise<string> {
  const pins = pinsFileSchema.parse(
    await readJson(join(directory, 'canonical', 'pins.json')),
  );

  const snapshotId = pins.sources[id];

  if (!snapshotId) {
    throw new Error(`Source is not pinned: ${id}`);
  }

  return extractSource(directory, id, snapshotId);
}

export { extractPinnedSource, extractSource };
