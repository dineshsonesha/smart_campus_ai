import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import './index.css';
import App from './App.tsx';

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster theme="dark" position="top-right" closeButton richColors />
  </QueryClientProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContent />
  </StrictMode>,
);
