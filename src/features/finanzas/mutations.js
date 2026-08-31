/**
 * Hooks useMutation para el módulo Finanzas.
 *
 * Patrón obligatorio tras cada mutación confirmada por el backend:
 *   → invalidar las query keys afectadas (no parchear manualmente arrays React)
 *
 * Fases que usan estos hooks:
 *   Fase 3 → useCrearMovimiento, useEditarMovimiento, useEliminarMovimiento
 *   Fase 5 → useEditarFactura, useEliminarFactura
 *   Fase 7 → useSetMovimientosFactura, useSetFacturasMovimiento
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
  bulkDeleteMovimientos,
  bulkEditMovimientos,
  setFacturasMovimiento,
  updateFactura,
  deleteFactura,
  setMovimientosFactura,
  createCliente,
  updateCliente,
  createEquipo,
  updateEquipo,
  createProveedor,
  updateProveedor,
  deleteContacto,
} from './api';
import { movimientoKeys, facturaKeys, dashboardKeys, fiscalKeys, contactoKeys } from './queryKeys';

// ── MOVIMIENTOS ──────────────────────────────────────────────────────────────

export function useCrearMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMovimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useEditarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMovimiento(id, data),
    onSuccess: (updatedMovimiento) => {
      if (updatedMovimiento?.id) {
        // Actualiza el detalle en caché directamente con la respuesta del backend
        qc.setQueryData(movimientoKeys.detail(updatedMovimiento.id), updatedMovimiento);
      }
      qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
      qc.invalidateQueries({ queryKey: movimientoKeys.paraVincular() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useEliminarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMovimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useBulkDeleteMovimientos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteMovimientos,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useBulkEditMovimientos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, cambios }) => bulkEditMovimientos(ids, cambios),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// ── VINCULACIÓN FACTURA ↔ MOVIMIENTO ─────────────────────────────────────────

/** Desde el lado del movimiento: reemplaza todas sus facturas vinculadas. */
export function useSetFacturasMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movimientoId, facturaIds }) => setFacturasMovimiento(movimientoId, facturaIds),
    onSuccess: (_data, { movimientoId }) => {
      // Invalida ambos lados: el movimiento y todas las facturas
      qc.invalidateQueries({ queryKey: movimientoKeys.detail(movimientoId) });
      qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
      qc.invalidateQueries({ queryKey: facturaKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/** Desde el lado de la factura: reemplaza todos sus movimientos vinculados. */
export function useSetMovimientosFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ facturaId, movimientoIds }) => setMovimientosFactura(facturaId, movimientoIds),
    onSuccess: (_data, { facturaId }) => {
      qc.invalidateQueries({ queryKey: facturaKeys.detail(facturaId) });
      qc.invalidateQueries({ queryKey: facturaKeys.lists() });
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// ── FACTURAS ─────────────────────────────────────────────────────────────────

export function useEditarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFactura(id, data),
    onSuccess: (updatedFactura) => {
      if (updatedFactura?.id) {
        qc.setQueryData(facturaKeys.detail(updatedFactura.id), updatedFactura);
      }
      qc.invalidateQueries({ queryKey: facturaKeys.lists() });
    },
  });
}

export function useEliminarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facturaKeys.all });
    },
  });
}

// ── CONTACTOS ────────────────────────────────────────────────────────────────

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useEditarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCliente(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useCrearEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEquipo,
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useEditarEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEquipo(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useEditarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProveedor(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
export function useEliminarContacto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContacto,
    onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
  });
}
