import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { captureSource, verifySources } from './capture/index.ts';
import { extractPinnedSource } from './extract/index.ts';
import { publishResearch } from './publish/index.ts';

const dataDirectory = fileURLToPath(new URL('../../data/', import.meta.url));

async function main(args: string[]): Promise<void> {
  const [command, id] = args;

  if (command === 'capture' && id && args.length === 2) {
    const snapshot = await captureSource(dataDirectory, id);
    process.stdout.write(`Captured ${id}: ${snapshot}\n`);

    return;
  }

  if (command === 'verify' && args.length === 1) {
    const count = await verifySources(dataDirectory);
    process.stdout.write(`Verified ${count} snapshots.\n`);

    return;
  }

  if (command === 'extract' && id && args.length === 2) {
    const output = await extractPinnedSource(dataDirectory, id);
    process.stdout.write(`Extracted ${id} to ${output}\n`);

    return;
  }

  if (command === 'build' && args.length === 1) {
    const output = await publishResearch(dataDirectory);
    process.stdout.write(`Wrote ${output}\n`);

    return;
  }

  throw new Error(
    'Usage: node scripts/data/cli.ts capture <source-id>|verify|extract <source-id>|build',
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  await main(process.argv.slice(2));
}
