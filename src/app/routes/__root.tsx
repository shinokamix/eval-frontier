import {
  createRootRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';

import { Header } from '@/module/header';
import {
  reducedRevealVariants,
  revealVariants,
} from '@/shared/animation/reveal';

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div
        key={pathname}
        animate="open"
        initial={reduceMotion === true ? false : 'closed'}
        variants={
          reduceMotion === true ? reducedRevealVariants : revealVariants
        }
      >
        <Outlet />
      </motion.div>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
