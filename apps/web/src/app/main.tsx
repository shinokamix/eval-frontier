import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/commit-mono/400.css';
import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';

import 'lenis/dist/lenis.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouter } from './router.tsx';

import './styles.css';

function getRootElement(): HTMLElement {
  const root = document.querySelector('#root');

  if (!(root instanceof HTMLElement)) {
    throw new Error('Missing #root element');
  }

  return root;
}

// eslint-disable-next-line no-new -- Lenis runs for the lifetime of the page.
new Lenis({ autoRaf: true, lerp: 0.12, stopInertiaOnNavigate: true });

createRoot(getRootElement()).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AppRouter />
    </MotionConfig>
  </StrictMode>,
);
