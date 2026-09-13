import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';

import { Header } from '@/module/header';
import { reducedRevealVariants } from '@/shared/animation/reveal';
import { routeTransitionVariants } from '@/shared/animation/route-transition';
import { EdgeBlur } from '@/shared/components/edge-blur';

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const reduceMotion = useReducedMotion();

  return (
    <div className="page-layout min-h-screen">
      <Header />
      <motion.div
        key={pathname}
        animate="open"
        initial={reduceMotion === true ? false : 'closed'}
        variants={
          reduceMotion === true
            ? reducedRevealVariants
            : routeTransitionVariants
        }
      >
        <Outlet />
      </motion.div>
      <EdgeBlur edge="top" />
      <EdgeBlur edge="bottom" />
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
