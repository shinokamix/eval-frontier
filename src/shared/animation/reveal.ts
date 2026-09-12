import { type Variants } from 'motion/react';

const easeStart = 0.22;
const easeEnd = 0.36;

const revealVariants: Variants = {
  open: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [easeStart, 1, easeEnd, 1] },
  },
  closed: {
    opacity: 0,
    filter: 'blur(8px)',
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

const reducedRevealVariants: Variants = {
  open: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0 } },
  closed: { opacity: 0, filter: 'blur(0px)', transition: { duration: 0 } },
};

export { reducedRevealVariants, revealVariants };
