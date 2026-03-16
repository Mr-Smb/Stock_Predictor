import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './ui/app.tsx';
import { ErrorBoundary } from './ui/components/error_boundary';
import './ui/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
