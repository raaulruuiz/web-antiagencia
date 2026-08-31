import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 2 minutos: Realtime invalida cuando hay cambios reales.
      // window focus actúa como reconciliación adicional si Realtime
      // perdió eventos mientras la pestaña estuvo inactiva.
      staleTime: 2 * 60 * 1000,
    },
  },
});
