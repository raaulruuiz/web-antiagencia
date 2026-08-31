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
  guardarFacturas,
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
      // PUT devuelve campos base + factura_ids, pero SIN clientes_info/equipo_info/
      // proveedores_info/facturas_info que sí incluye GET detail.
      // Reemplazar la caché de detail con el objeto parcial causaría pérdida de info
      // en el modal → se invalida para que GET detail vuelva a obtenerse completo.
      if (updatedMovimiento?.id) {
        qc.invalidateQueries({ queryKey: movimientoKeys.detail(updatedMovimiento.id) });
      }
      qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
      qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
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
      qc.invalidateQueries({ queryKey: movimientoKeys.detail(movimientoId) });
      qc.invalidateQueries({ queryKey: movimientoKeys.lists() });
      qc.invalidateQueries({ queryKey: movimientoKeys.paraVincularAll() });
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
      qc.invalidateQueries({ queryKey: facturaKeys.paraVincularAll() });
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// ── FACTURAS ─────────────────────────────────────────────────────────────────

export function useGuardarFacturas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: guardarFacturas,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facturaKeys.all });
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      // El endpoint puede actualizar datos de contactos (NIF, email, etc.)
      qc.invalidateQueries({ queryKey: contactoKeys.all });
    },
  });
}

export function useEditarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFactura(id, data),
    onSuccess: (updatedFactura) => {
      // PATCH devuelve select('*') pero sin movimiento_ids (junction no consultada).
      // GET detail sí añade movimiento_ids → reemplazar caché con objeto parcial causaría
      // pérdida del vínculo en el viewer → se invalida para re-fetch completo.
      if (updatedFactura?.id) {
        qc.invalidateQueries({ queryKey: facturaKeys.detail(updatedFactura.id) });
      }
      // Los movimientos pueden contener facturas_info enriquecida — invalida ambas familias
      qc.invalidateQueries({ queryKey: facturaKeys.lists() });
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
    },
  });
}

export function useEliminarFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFactura,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facturaKeys.all });
      // Movimientos vinculados reflejan info de la factura — limpiar también
      qc.invalidateQueries({ queryKey: movimientoKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

// ── CONTACTOS ────────────────────────────────────────────────────────────────
// Movimientos y facturas devuelven información enriquecida de contactos.
// Cualquier cambio en un contacto puede dejar cacheados datos de nombre/empresa
// desactualizados en esas familias. Se invalidan las tres familias hasta que
// en una fase posterior podamos ser más quirúrgicos.

function invalidarContactoYDerivados(qc) {
  qc.invalidateQueries({ queryKey: contactoKeys.all });
  qc.invalidateQueries({ queryKey: movimientoKeys.all });
  qc.invalidateQueries({ queryKey: facturaKeys.all });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useEditarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCliente(id, data),
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useCrearEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEquipo,
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useEditarEquipo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEquipo(id, data),
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useEditarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProveedor(id, data),
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
export function useEliminarContacto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContacto,
    onSuccess: () => invalidarContactoYDerivados(qc),
  });
}
