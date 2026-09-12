import { type Variants } from 'motion/react';

import { revealEase } from './reveal';

const routeTransitionVariants: Variants = {
  closed: { opacity: 0, filter: 'blur(25px)' },
  open: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: revealEase },
    // Release the page filter once text is sharp.
    transitionEnd: { filter: 'none' },
  },
};

export { routeTransitionVariants };
