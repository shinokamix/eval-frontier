import { extractOpenBench } from '../../adapters/openbench.ts';

const artifactPath = 'results.jsonl';

const extract = (jsonl: string) => extractOpenBench(jsonl, { condition: 'm4' });

export { artifactPath, extract };
