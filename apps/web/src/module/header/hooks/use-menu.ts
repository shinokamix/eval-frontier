import { useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useMediaQuery } from '@/shared/hooks/use-media-query';

function useMenu() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState(false);

  if (isDesktop && opened) {
    setOpened(false);
  }

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  useEffect(() => router.subscribe('onBeforeNavigate', close), [close, router]);

  return { close, headerRef, isDesktop, opened, setOpened };
}

export { useMenu };
