import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { motion } from 'motion/react';

import { Header } from '@/module/header';
import { revealEase } from '@/shared/animation/reveal';
import { EdgeBlur } from '@/shared/components/edge-blur';

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="page-layout min-h-screen">
      <Header />
      <motion.div
        key={pathname}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: revealEase }}
      >
        <Outlet />
      </motion.div>
      <EdgeBlur edge="top" />
      <EdgeBlur edge="bottom" />
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
