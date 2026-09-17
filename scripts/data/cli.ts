import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { captureSource, verifySources } from './raw.ts';

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

  throw new Error('Usage: node scripts/data/cli.ts capture <source-id>|verify');
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  await main(process.argv.slice(2));
}
