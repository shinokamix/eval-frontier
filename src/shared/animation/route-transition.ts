import { type Variants } from 'motion/react';

import { revealEase } from './reveal';

const routeTransitionVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.5, ease: revealEase } },
};

export { routeTransitionVariants };
