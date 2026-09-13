import { useEffect, useState } from 'react';

import { loadResearchData } from '../api/load-research';
import { type ScatterPoint } from '../types/scatter-point';

function useResearch() {
  const [data, setData] = useState<readonly ScatterPoint[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const points = await loadResearchData();

        if (isCurrent) setData(points);
      } catch {
        if (isCurrent) setIsError(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isCurrent = false;
    };
  }, []);

  return { data, isLoading, isError };
}

export { useResearch };
