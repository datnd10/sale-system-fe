import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // Luôn fetch mới khi vào page
      gcTime: 1000 * 60 * 5,    // Giữ cache 5 phút để tránh flash khi navigate
      retry: 1,
      refetchOnWindowFocus: true, // Refetch khi focus lại tab
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
