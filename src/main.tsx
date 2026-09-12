import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';

import './index.css';

function getRootElement(): HTMLElement {
  const root = document.querySelector('#root');

  if (!(root instanceof HTMLElement)) {
    throw new Error('Missing #root element');
  }

  return root;
}

createRoot(getRootElement()).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
