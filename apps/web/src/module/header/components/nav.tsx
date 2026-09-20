import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';

import { navigation } from '@/module/header/constants/navigation';
import { revealVariants } from '@/shared/animation/reveal';

import { UnderlinedLabel } from './underlined-label';

interface NavProps {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

function isActive(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function Nav({ pathname, onNavigate, mobile = false }: NavProps) {
  return navigation.map((item) => {
    const active = isActive(pathname, item.to);

    const link = (
      <Link
        aria-current={active && 'page'}
        className="group"
        key={item.to}
        onClick={onNavigate}
        to={item.to}
      >
        <UnderlinedLabel
          active={active}
          size={mobile ? 'navigation' : undefined}
        >
          {item.label}
        </UnderlinedLabel>
      </Link>
    );

    return mobile ? (
      <motion.div
        key={item.to}
        variants={revealVariants}
      >
        {link}
      </motion.div>
    ) : (
      link
    );
  });
}

export { Nav };
