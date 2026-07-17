import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element not found — cannot mount React application');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
