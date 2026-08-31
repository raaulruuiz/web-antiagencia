import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // 2 minutos: Realtime invalida cuando hay cambios reales;
      // si Realtime falla, los datos se consideran stale tras 2 min.
      staleTime: 2 * 60 * 1000,
    },
  },
});
