import { useCallback, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const matchMedia = globalThis.matchMedia(query);

      matchMedia.addEventListener('change', onStoreChange);

      return () => {
        matchMedia.removeEventListener('change', onStoreChange);
      };
    },
    [query],
  );

  const getSnapshot = () => globalThis.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { useMediaQuery };
