import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const source = path.join(root, 'research/build/research.json');
const target = path.join(root, 'apps/web/public/data/research.json');

if (!fs.existsSync(source)) {
  throw new Error(`Research artifact does not exist: ${source}`);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
