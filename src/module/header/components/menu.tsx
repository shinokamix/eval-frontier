import { Dialog } from '@base-ui/react/dialog';
import { motion } from 'motion/react';

import {
  footerVariants,
  listVariants,
} from '@/module/header/constants/animation';
import { Text } from '@/shared/components/text';

import { Nav } from './nav';

interface MenuProps {
  pathname: string;
  onClose: () => void;
}

function Menu({ pathname, onClose }: MenuProps) {
  return (
    <Dialog.Popup
      className="fixed inset-0 z-10 overflow-y-auto bg-[#090909] page-gutter pt-28 pb-8 opacity-100 transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 md:hidden"
      id="mobile-navigation"
    >
      <Dialog.Title className="sr-only">
        <Text variant="inline">Mobile navigation</Text>
      </Dialog.Title>
      <nav
        aria-label="Mobile navigation"
        className="flex min-h-full flex-col justify-between gap-8"
      >
        <motion.div
          animate="open"
          className="flex flex-col items-start gap-6"
          initial="closed"
          variants={listVariants}
        >
          <Nav
            mobile
            onNavigate={onClose}
            pathname={pathname}
          />
        </motion.div>

        <motion.div
          animate="open"
          className="flex items-end justify-between text-[#8d8a82]"
          initial="closed"
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
      <Dialog.Close className="sr-only">
        <Text variant="inline">Close menu</Text>
      </Dialog.Close>
    </Dialog.Popup>
  );
}

export { Menu };
