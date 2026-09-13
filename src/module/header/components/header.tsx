import { Link, useRouterState } from '@tanstack/react-router';

import { useMenu } from '@/module/header/hooks/use-menu';
import { EdgeBlur } from '@/shared/components/edge-blur';

import { Menu } from './menu';
import { Nav } from './nav';
import { UnderlinedLabel } from './underlined-label';

function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { opened, close, toggle, headerRef, buttonRef, menuRef } = useMenu();

  return (
    <header
      className="page-gutter fixed inset-x-0 top-0 z-50 pt-6 md:pt-10"
      ref={headerRef}
    >
      <EdgeBlur edge="top" />
      <nav
        aria-label="Primary navigation"
        className="relative z-20 flex h-7 items-center justify-between md:h-auto md:items-start"
      >
        <Link
          className="group inline-flex"
          onClick={close}
          to="/"
        >
          <UnderlinedLabel active={pathname === '/'}>HP/26</UnderlinedLabel>
        </Link>

        <div className="hidden gap-[clamp(2rem,8vw,8rem)] md:flex">
          <Nav pathname={pathname} />
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={opened}
          aria-label={opened ? 'Close menu' : 'Open menu'}
          className="group -m-2.5 flex size-11 shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-offset-2 md:hidden"
          onClick={toggle}
          ref={buttonRef}
          type="button"
        >
          <span
            aria-hidden="true"
            className="relative block size-6"
          >
            <span className="absolute inset-x-0 top-[3px] h-px bg-current transition-transform duration-300 ease-out group-aria-expanded:translate-y-[8px] group-aria-expanded:rotate-45 motion-reduce:transition-none" />
            <span className="absolute inset-x-0 top-[11px] h-px bg-current transition-opacity duration-300 ease-out group-aria-expanded:opacity-0 motion-reduce:transition-none" />
            <span className="absolute inset-x-0 top-[19px] h-px bg-current transition-transform duration-300 ease-out group-aria-expanded:-translate-y-[8px] group-aria-expanded:-rotate-45 motion-reduce:transition-none" />
          </span>
        </button>
      </nav>

      {/* Keep the menu mounted for its closing animation. */}
      <Menu
        opened={opened}
        onClose={close}
        pathname={pathname}
        ref={menuRef}
      />
    </header>
  );
}

export { Header };
