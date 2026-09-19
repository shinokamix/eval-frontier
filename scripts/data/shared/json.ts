import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

function parseJson(contents: string): unknown {
  return JSON.parse(contents);
}

async function readJson(path: string): Promise<unknown> {
  return parseJson(await readFile(path, 'utf8'));
}

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, serialize(value));
}

export { readJson, writeJson };
