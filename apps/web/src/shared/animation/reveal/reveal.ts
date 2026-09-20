import { type Variants } from 'motion/react';

const revealEase = [0.22, 1, 0.36, 1] as const;

const revealVariants: Variants = {
  open: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: revealEase },
  },
  closed: {
    opacity: 0,
    filter: 'blur(8px)',
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export { revealEase, revealVariants };
