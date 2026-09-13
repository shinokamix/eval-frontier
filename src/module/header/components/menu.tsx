import { motion } from 'motion/react';
import { type Ref } from 'react';

import {
  footerVariants,
  listVariants,
  menuVariants,
} from '@/module/header/constants/animation';
import { Text } from '@/shared/components/text';

import { Nav } from './nav';

interface MenuProps {
  opened: boolean;
  pathname: string;
  onClose: () => void;
  ref: Ref<HTMLDivElement>;
}

function Menu({ opened, pathname, onClose, ref }: MenuProps) {
  const animation = opened ? 'open' : 'closed';

  return (
    <motion.div
      animate={animation}
      aria-hidden={!opened}
      className="fixed inset-0 z-10 overflow-y-auto bg-[#090909] page-gutter pt-28 pb-8 md:hidden"
      id="mobile-navigation"
      inert={!opened}
      initial={false}
      ref={ref}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      variants={menuVariants}
    >
      <nav
        aria-label="Mobile navigation"
        className="flex min-h-full flex-col justify-between gap-8"
      >
        <motion.div
          className="flex flex-col items-start gap-6"
          variants={listVariants}
        >
          <Nav
            mobile
            onNavigate={onClose}
            pathname={pathname}
          />
        </motion.div>

        <motion.div
          className="flex items-end justify-between text-[#8d8a82]"
          variants={footerVariants}
        >
          <div className="flex flex-col">
            <Text
              as="span"
              variant="value"
            >
              MODEL × HARNESS
            </Text>
            <Text
              as="span"
              variant="value"
            >
              BENCHMARK INDEX
            </Text>
          </div>
          <Text
            as="span"
            variant="value"
          >
            2026
          </Text>
        </motion.div>
      </nav>
    </motion.div>
  );
}

export { Menu };
