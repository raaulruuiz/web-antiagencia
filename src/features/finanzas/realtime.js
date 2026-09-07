/**
 * Hook centralizado de Supabase Realtime para el módulo Finanzas.
 *
 * Arquitectura:
 *   Postgres → Supabase Realtime event → queryClient.invalidateQueries(...)
 *   → HTTP canónico Express → TanStack Query → React
 *
 * Realtime es SEÑAL DE INVALIDACIÓN, nunca fuente de verdad.
 * Los callbacks SOLO llaman invalidateQueries. Ningún setState, setQueryData,
 * fetch HTTP ni uso de payload como datos canónicos.
 *
 * Tablas activas (en supabase_realtime publication):
 *   public.finanzas_movimientos ✓
 *
 * Tablas pendientes de autorización (NO incluir hasta ALTER PUBLICATION + autorización):
 *   public.finanzas_facturas
 *   public.finanzas_facturas_movimientos
 *   public.contactos
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { movimientoKeys, dashboardKeys, fiscalKeys } from './queryKeys';

export function useFinanzasRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel('finanzas-movimientos')

      // INSERT: nuevo movimiento → listas + selectors + dashboard + fiscal
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'finanzas_movimientos' }, () => {
        qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
        qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all });
        qc.invalidateQueries({ queryKey: fiscalKeys.all });
      })

      // UPDATE: usa payload.new.id para invalidar solo el detail concreto + listas
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'finanzas_movimientos' }, (payload) => {
        const id = payload.new?.id;
        qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
        if (id) qc.invalidateQueries({ queryKey: movimientoKeys.detail(id) });
        qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all });
        qc.invalidateQueries({ queryKey: fiscalKeys.all });
      })

      // DELETE: usa payload.old.id para invalidar el detail + listas + selectors
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'finanzas_movimientos' }, (payload) => {
        const id = payload.old?.id;
        qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
        if (id) qc.invalidateQueries({ queryKey: movimientoKeys.detail(id) });
        qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: dashboardKeys.all });
        qc.invalidateQueries({ queryKey: fiscalKeys.all });
      })

      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [qc]);
}
