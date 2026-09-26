import { useEffect, useState } from 'react';

import { loadResearchData } from '../api/load-research';
import { type ResearchData } from '../schema/research';

// The research data, or undefined until it loads. A failed load leaves the
// graph empty and logs the error.
function useResearch() {
  const [data, setData] = useState<ResearchData>();

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      const research = await loadResearchData();

      if (isCurrent) setData(research);
    }

    load().catch((error: unknown) => {
      console.error(error);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return data;
}

export { useResearch };
