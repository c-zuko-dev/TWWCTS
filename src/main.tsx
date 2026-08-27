// Safe patch for environments where window.fetch only has a getter
try {
  let _currentFetch = window.fetch ? window.fetch.bind(window) : undefined;
  Object.defineProperty(window, 'fetch', {
    get() {
      return _currentFetch;
    },
    set(newFetch) {
      _currentFetch = newFetch;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  // Ignore if property is already configured
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
