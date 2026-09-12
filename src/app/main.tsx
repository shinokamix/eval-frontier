import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/commit-mono/400.css';
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

createRoot(getRootElement()).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
