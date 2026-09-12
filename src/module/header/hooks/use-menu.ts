import { useRouter } from '@tanstack/react-router';
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useMediaQuery } from '@/shared/hooks/use-media-query';

function trapFocus(event: KeyboardEvent, header: HTMLElement) {
  const controls = [
    ...header.querySelectorAll<HTMLElement>('a, button'),
  ].filter((element) => element.getClientRects().length > 0);

  const first = controls.at(0);
  const last = controls.at(-1);

  if (!first || !last) {
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

interface MenuElements {
  header: HTMLElement;
  menu: HTMLDivElement;
}

function activateMenu({ header, menu }: MenuElements, close: () => void) {
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const frame = globalThis.requestAnimationFrame(() => {
    const firstLink = menu.querySelector('a');

    if (firstLink) {
      firstLink.focus();
    }
  });

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'Tab') {
      trapFocus(event, header);
    }
  }

  globalThis.addEventListener('keydown', onKeyDown);

  return () => {
    globalThis.cancelAnimationFrame(frame);
    document.body.style.overflow = previousOverflow;
    globalThis.removeEventListener('keydown', onKeyDown);
  };
}

interface MenuFocusElements {
  header: HTMLElement | null;
  menu: HTMLDivElement | null;
  button: HTMLButtonElement | null;
}

function restoreMenuFocus({ header, menu, button }: MenuFocusElements) {
  const { activeElement } = document;

  const focusIsInMobileNavigation =
    activeElement === button || (menu?.contains(activeElement) ?? false);

  if (!focusIsInMobileNavigation) {
    return;
  }

  const homeLink = header?.querySelector<HTMLElement>('a');

  const focusTarget =
    button && button.getClientRects().length > 0 ? button : homeLink;

  focusTarget?.focus();
}

function useMenuState(
  headerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
) {
  const [opened, setOpened] = useState(false);

  const close = useCallback(() => {
    restoreMenuFocus({
      header: headerRef.current,
      menu: menuRef.current,
      button: buttonRef.current,
    });

    setOpened(false);
  }, [headerRef, menuRef, buttonRef]);

  const toggle = useCallback(() => {
    setOpened((current) => !current);
  }, []);

  return { opened, close, toggle };
}

function useMenu() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { opened, close, toggle } = useMenuState(headerRef, menuRef, buttonRef);

  // CSS controls which navigation is visible. JS only resets mobile state after a resize.
  useEffect(() => {
    if (isDesktop) {
      close();
    }
  }, [isDesktop, close]);

  useEffect(() => router.subscribe('onBeforeNavigate', close), [router, close]);

  useEffect(() => {
    const header = headerRef.current;
    const menu = menuRef.current;

    if (!opened || !header || !menu) {
      return;
    }

    // oxlint-disable-next-line typescript/consistent-return -- React effects may omit cleanup when inactive.
    return activateMenu({ header, menu }, close);
  }, [opened, close]);

  return { opened, close, toggle, headerRef, buttonRef, menuRef };
}

export { useMenu };
