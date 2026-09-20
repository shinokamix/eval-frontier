import { extractOpenBench } from '../../adapters/openbench.ts';

const artifactPath = 'results.jsonl';

const extract = (jsonl: string) =>
  extractOpenBench(jsonl, {
    condition: 'm3',
    unreportedEffortHarnesses: ['devin'],
  });

export { artifactPath, extract };
