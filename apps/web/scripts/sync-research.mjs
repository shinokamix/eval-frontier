import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const source = path.join(root, 'research/build/research.json');
const target = path.join(root, 'apps/web/public/data/research.json');

fs.mkdirSync(path.dirname(target), { recursive: true });

if (fs.existsSync(source)) {
  fs.copyFileSync(source, target);
} else {
  // The research build currently publishes evidence.parquet only. Keep the
  // web data contract empty until a later analysis stage returns.
  fs.writeFileSync(target, JSON.stringify({ studies: [] }, null, 2) + '\n');
}
