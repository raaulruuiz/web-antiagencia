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
 *   public.finanzas_movimientos          ✓
 *   public.finanzas_facturas             ✓
 *   public.finanzas_facturas_movimientos ✓
 *   public.contactos                     ✓ (FASE 11E4B)
 *
 * contactos: INSERT/UPDATE/DELETE invalidan solo contactoKeys.all +
 * movimientoKeys.all (el detail de movimiento resuelve nombres de
 * contacto en vivo en el backend). NO invalida facturaKeys (nombre_entidad/
 * nif_cif son columnas propias de la factura, sin join a contactos — ver
 * auditoría FASE 11E4A), ni fiscalKeys/dashboardKeys (0 dependencia real).
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { movimientoKeys, facturaKeys, dashboardKeys, fiscalKeys, contactoKeys } from './queryKeys';

export function useFinanzasRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const chMov = supabase
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

    const chFac = supabase
      .channel('finanzas-facturas')

      // INSERT: nueva factura → listas + selector. Sin movimientoKeys: ningún movimiento
      // la referencia aún (no hay entradas en junction todavía).
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'finanzas_facturas' }, () => {
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
      })

      // UPDATE: usa payload.new.id quirúrgico para el detail; movimientoKeys.all porque
      // el detail de movimiento embeds facturas_info (archivo_nombre/nombre_entidad/importe_total)
      // y no podemos saber qué movimientos referencian esta factura sin consulta adicional.
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'finanzas_facturas' }, (payload) => {
        const id = payload.new?.id;
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        if (id) qc.invalidateQueries({ queryKey: facturaKeys.detail(id) });
        qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: movimientoKeys.all });
      })

      // DELETE: usa payload.old.id; viewer mostrará error state (404 → isError).
      // movimientoKeys.all: CASCADE delete en junction eliminó el vínculo → details stale.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'finanzas_facturas' }, (payload) => {
        const id = payload.old?.id;
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        if (id) qc.invalidateQueries({ queryKey: facturaKeys.detail(id) });
        qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: movimientoKeys.all });
      })

      .subscribe();

    const chJunction = supabase
      .channel('finanzas-junction')

      // Auditoría backend: la app solo genera INSERT y DELETE en junction.
      // La app NO emite UPDATE directo sobre filas junction desde el flujo frontend.
      // handleVincularFacturaMov (upsert) existe en backend pero NO es llamado por el frontend.
      //
      // Replica identity DEFAULT + PK(factura_id, movimiento_id) → ambos IDs disponibles
      // en payload.old en DELETE sin necesidad de REPLICA IDENTITY FULL.
      //
      // Responsabilidad de este channel:
      //   · factura_ids / movimiento_ids cruzados (relaciones estructurales)
      //   · selectors para vincular
      // Dashboard/Fiscal NO: los maneja el UPDATE de finanzas_movimientos (10A)
      // que llega por recalcularCamposFactura tras cada vinculación.

      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'finanzas_facturas_movimientos' }, (payload) => {
        const facturaId    = payload.new?.factura_id;
        const movimientoId = payload.new?.movimiento_id;
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
        qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
        if (facturaId)    qc.invalidateQueries({ queryKey: facturaKeys.detail(facturaId) });
        if (movimientoId) qc.invalidateQueries({ queryKey: movimientoKeys.detail(movimientoId) });
      })

      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'finanzas_facturas_movimientos' }, (payload) => {
        const facturaId    = payload.old?.factura_id;
        const movimientoId = payload.old?.movimiento_id;
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
        qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
        qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
        if (facturaId)    qc.invalidateQueries({ queryKey: facturaKeys.detail(facturaId) });
        if (movimientoId) qc.invalidateQueries({ queryKey: movimientoKeys.detail(movimientoId) });
      })

      .subscribe();

    const chContactos = supabase
      .channel('finanzas-contactos')

      // INSERT/UPDATE/DELETE: mismo tratamiento para los tres — invalidación
      // amplia por familia, sin inspeccionar payload (auditoría FASE 11E4A).
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contactos' }, () => {
        qc.invalidateQueries({ queryKey: contactoKeys.all });
        qc.invalidateQueries({ queryKey: movimientoKeys.all });
      })

      .subscribe();

    return () => {
      supabase.removeChannel(chMov);
      supabase.removeChannel(chFac);
      supabase.removeChannel(chJunction);
      supabase.removeChannel(chContactos);
    };
  }, [qc]);
}
