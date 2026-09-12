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
        className="relative z-20 flex items-start justify-between"
      >
        <Link
          // oxlint-disable-next-line react/forbid-component-props -- Link renders the focusable anchor.
          className="group"
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
          className="group -m-3 flex items-center p-3 md:hidden"
          onClick={toggle}
          ref={buttonRef}
          type="button"
        >
          <UnderlinedLabel active={opened}>
            {opened ? 'CLOSE' : 'MENU'}
          </UnderlinedLabel>
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
