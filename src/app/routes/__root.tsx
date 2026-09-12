import { createRootRoute, Outlet } from '@tanstack/react-router';

import { AppHeader } from '@/shared/components/app-header';

function RootLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  );
}

export const Route = createRootRoute({ component: RootLayout });
