import { stagger, type Variants } from 'motion/react';

const itemInterval = 0.06;
const revealStart = 0.08;

const menuVariants: Variants = {
  open: { opacity: 1, visibility: 'visible' },
  closed: { opacity: 0, transitionEnd: { visibility: 'hidden' } },
};

const listVariants: Variants = {
  open: {
    transition: {
      delayChildren: stagger(itemInterval, { startDelay: revealStart }),
    },
  },
  closed: { transition: { delayChildren: 0 } },
};

const footerVariants: Variants = {
  open: { opacity: 1, transition: { duration: 0.2, delay: 0.22 } },
  closed: { opacity: 0, transition: { duration: 0.18 } },
};

export { footerVariants, listVariants, menuVariants };
