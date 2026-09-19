import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';

import { readJson, writeJson } from '../shared/json.ts';

interface SourceArtifact {
  path: string;
  role: string;
  url: string;
}

interface SourceDefinition {
  schemaVersion: 1;
  id: string;
  title: string;
  canonicalUrl: string;
  license: string;
  redistribution: 'allowed' | 'unknown' | 'restricted';
  artifacts: SourceArtifact[];
}

interface CapturedArtifact {
  path: string;
  role: string;
  mediaType: string | null;
  sha256: string;
  acquisition: {
    type: 'http';
    url: string;
    finalUrl: string;
    method: 'GET';
    status: number;
  };
}

interface SnapshotManifest {
  schemaVersion: 1;
  snapshotId: string;
  sourceId: string;
  title: string;
  canonicalUrl: string;
  capturedAt: string;
  license: string;
  redistribution: SourceDefinition['redistribution'];
  artifacts: CapturedArtifact[];
}

interface CaptureOptions {
  fetch?: (url: string) => Promise<Response>;
  now?: () => Date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`Invalid ${label}`);

  return value;
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid ${label}`);
  }

  return value;
}

function httpUrl(value: unknown, label: string): string {
  const result = text(value, label);
  const url = new URL(result);

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Invalid ${label}`);
  }

  return result;
}

function sourceId(value: unknown): string {
  const id = text(value, 'source ID');

  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(id)) {
    throw new Error('Invalid source ID');
  }

  return id;
}

function artifactPath(value: unknown): string {
  const path = text(value, 'artifact path');

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(path)) {
    throw new Error('Invalid artifact path');
  }

  return path;
}

function redistribution(value: unknown): SourceDefinition['redistribution'] {
  if (value !== 'allowed' && value !== 'unknown' && value !== 'restricted') {
    throw new Error('Invalid redistribution status');
  }

  return value;
}

function parseSource(value: unknown, expectedId: string): SourceDefinition {
  const input = record(value, 'source definition');
  const id = sourceId(input.id);

  if (input.schemaVersion !== 1)
    throw new Error('Invalid source schema version');
  if (id !== expectedId)
    throw new Error('Source ID does not match its directory');

  if (!Array.isArray(input.artifacts) || input.artifacts.length === 0) {
    throw new Error('Source has no artifacts');
  }

  const paths = new Set<string>();

  const artifacts = input.artifacts.map((entry, index) => {
    const artifact = record(entry, `artifact ${index}`);
    const path = artifactPath(artifact.path);

    if (paths.has(path)) throw new Error(`Duplicate artifact path: ${path}`);
    paths.add(path);

    return {
      path,
      role: text(artifact.role, 'artifact role'),
      url: httpUrl(artifact.url, 'artifact URL'),
    };
  });

  return {
    schemaVersion: 1,
    id,
    title: text(input.title, 'source title'),
    canonicalUrl: httpUrl(input.canonicalUrl, 'canonical URL'),
    license: text(input.license, 'source license'),
    redistribution: redistribution(input.redistribution),
    artifacts,
  };
}

function parseCapturedArtifact(
  value: unknown,
  index: number,
): CapturedArtifact {
  const artifact = record(value, `captured artifact ${index}`);
  const acquisition = record(artifact.acquisition, 'artifact acquisition');
  const checksum = text(artifact.sha256, 'artifact checksum');

  if (!/^[a-f0-9]{64}$/.test(checksum)) {
    throw new Error('Invalid artifact checksum');
  }

  if (artifact.mediaType !== null && typeof artifact.mediaType !== 'string') {
    throw new Error('Invalid artifact media type');
  }

  if (acquisition.type !== 'http' || acquisition.method !== 'GET') {
    throw new Error('Invalid acquisition method');
  }

  if (
    typeof acquisition.status !== 'number' ||
    !Number.isInteger(acquisition.status) ||
    acquisition.status < 200 ||
    acquisition.status >= 300
  ) {
    throw new Error('Invalid response status');
  }

  return {
    path: `artifacts/${artifactPath(
      text(artifact.path, 'captured artifact path').replace(/^artifacts\//, ''),
    )}`,
    role: text(artifact.role, 'captured artifact role'),
    mediaType: artifact.mediaType,
    sha256: checksum,
    acquisition: {
      type: 'http',
      url: httpUrl(acquisition.url, 'request URL'),
      finalUrl: httpUrl(acquisition.finalUrl, 'final response URL'),
      method: 'GET',
      status: acquisition.status,
    },
  };
}

function parseManifest(value: unknown, expectedId: string): SnapshotManifest {
  const input = record(value, 'snapshot manifest');

  if (input.schemaVersion !== 1) {
    throw new Error('Invalid manifest schema version');
  }

  if (!Array.isArray(input.artifacts) || input.artifacts.length === 0) {
    throw new Error('Snapshot has no artifacts');
  }

  const manifest: SnapshotManifest = {
    schemaVersion: 1,
    snapshotId: text(input.snapshotId, 'snapshot ID'),
    sourceId: sourceId(input.sourceId),
    title: text(input.title, 'source title'),
    canonicalUrl: httpUrl(input.canonicalUrl, 'canonical URL'),
    capturedAt: text(input.capturedAt, 'capture time'),
    license: text(input.license, 'source license'),
    redistribution: redistribution(input.redistribution),
    artifacts: input.artifacts.map(parseCapturedArtifact),
  };

  if (!Number.isFinite(Date.parse(manifest.capturedAt))) {
    throw new Error('Invalid capture time');
  }

  if (manifest.snapshotId !== expectedId) {
    throw new Error('Snapshot ID does not match its directory');
  }

  if (snapshotId(manifest.artifacts) !== expectedId) {
    throw new Error('Snapshot identity mismatch');
  }

  return manifest;
}

export function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function snapshotId(artifacts: CapturedArtifact[]): string {
  const identity = artifacts
    .map(({ path, sha256: checksum }) => ({ path, sha256: checksum }))
    .toSorted((left, right) => left.path.localeCompare(right.path));

  return sha256(Buffer.from(JSON.stringify(identity)));
}

export async function readSource(
  directory: string,
  id: string,
): Promise<SourceDefinition> {
  const validId = sourceId(id);

  return parseSource(
    await readJson(join(directory, 'sources', validId, 'source.json')),
    validId,
  );
}

export async function verifySnapshot(
  directory: string,
  source: string,
  snapshot: string,
): Promise<SnapshotManifest> {
  const id = sourceId(source);

  if (!/^[a-f0-9]{64}$/.test(snapshot)) throw new Error('Invalid snapshot ID');

  const snapshotDirectory = join(directory, 'sources', id, 'raw', snapshot);

  const manifest = parseManifest(
    await readJson(join(snapshotDirectory, 'manifest.json')),
    snapshot,
  );

  if (manifest.sourceId !== id) throw new Error('Wrong snapshot source');

  for (const artifact of manifest.artifacts) {
    const bytes = await readFile(join(snapshotDirectory, artifact.path));

    if (sha256(bytes) !== artifact.sha256) {
      throw new Error(`Artifact checksum mismatch: ${artifact.path}`);
    }
  }

  return manifest;
}

function errorCode(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;

  return typeof error.code === 'string' ? error.code : undefined;
}

export async function captureSource(
  directory: string,
  id: string,
  options: CaptureOptions = {},
): Promise<string> {
  const source = await readSource(directory, id);
  const request = options.fetch ?? ((url: string) => fetch(url));

  const artifacts: Array<{
    definition: SourceArtifact;
    captured: CapturedArtifact;
    bytes: Uint8Array;
  }> = [];

  for (const definition of source.artifacts) {
    const response = await request(definition.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${definition.url}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    artifacts.push({
      definition,
      bytes,
      captured: {
        path: `artifacts/${definition.path}`,
        role: definition.role,
        mediaType: response.headers.get('content-type'),
        sha256: sha256(bytes),
        acquisition: {
          type: 'http',
          url: definition.url,
          finalUrl: response.url || definition.url,
          method: 'GET',
          status: response.status,
        },
      },
    });
  }

  const captured = artifacts.map(({ captured: artifact }) => artifact);
  const idForSnapshot = snapshotId(captured);
  const sourceDirectory = join(directory, 'sources', source.id);
  const rawDirectory = join(sourceDirectory, 'raw');
  const destination = join(rawDirectory, idForSnapshot);
  const temporary = await mkdtemp(join(sourceDirectory, '.capture-'));

  const manifest: SnapshotManifest = {
    schemaVersion: 1,
    snapshotId: idForSnapshot,
    sourceId: source.id,
    title: source.title,
    canonicalUrl: source.canonicalUrl,
    capturedAt: (options.now ?? (() => new Date()))().toISOString(),
    license: source.license,
    redistribution: source.redistribution,
    artifacts: captured,
  };

  try {
    await mkdir(join(temporary, 'artifacts'));

    for (const artifact of artifacts) {
      await writeFile(
        join(temporary, 'artifacts', artifact.definition.path),
        artifact.bytes,
      );
    }

    await writeJson(join(temporary, 'manifest.json'), manifest);
    await mkdir(rawDirectory, { recursive: true });

    try {
      await rename(temporary, destination);
    } catch (error) {
      const code = errorCode(error);

      if (code !== 'EEXIST' && code !== 'ENOTEMPTY') throw error;
      await verifySnapshot(directory, source.id, idForSnapshot);
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }

  await verifySnapshot(directory, source.id, idForSnapshot);

  return idForSnapshot;
}

export async function verifySources(directory: string): Promise<number> {
  const sourcesDirectory = join(directory, 'sources');

  let sourceEntries;

  try {
    sourceEntries = await readdir(sourcesDirectory, { withFileTypes: true });
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return 0;
    throw error;
  }

  let count = 0;

  for (const sourceEntry of sourceEntries) {
    if (!sourceEntry.isDirectory()) continue;

    const source = await readSource(directory, sourceEntry.name);
    const rawDirectory = join(sourcesDirectory, source.id, 'raw');
    let snapshots;

    try {
      snapshots = await readdir(rawDirectory, { withFileTypes: true });
    } catch (error) {
      if (errorCode(error) === 'ENOENT') continue;
      throw error;
    }

    for (const snapshot of snapshots) {
      if (!snapshot.isDirectory()) continue;
      await verifySnapshot(directory, source.id, snapshot.name);
      count += 1;
    }
  }

  return count;
}
