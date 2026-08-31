/**
 * Hooks useQuery para el módulo Finanzas.
 *
 * Estado actual: infraestructura preparada. Los hooks se activarán fase a fase
 * a medida que se migre el server state de Finanzas.jsx.
 *
 * Fases que usan estos hooks:
 *   Fase 2 → useMovimientosParaVincular, useFacturasParaVincular
 *   Fase 3 → useMovimientos, useMovimiento
 *   Fase 4 → useMovimiento (modal)
 *   Fase 5 → useFacturas, useFactura
 *   Fase 8 → useDashboard
 *   Fase 9 → useFiscal
 */

import { useQuery } from '@tanstack/react-query';
import {
  getMovimientos,
  getMovimiento,
  getMovimientosParaVincular,
  getFacturas,
  getFactura,
  getFacturasParaVincular,
  getDashboard,
  getFiscal,
  getClientesLista,
  getEquipoLista,
  getProveedoresLista,
  getContactosTodos,
  getClientes,
  getEquipo,
  getProveedores,
} from './api';
import {
  movimientoKeys,
  facturaKeys,
  dashboardKeys,
  fiscalKeys,
  contactoKeys,
} from './queryKeys';

// ── MOVIMIENTOS ──────────────────────────────────────────────────────────────

export function useMovimientos(params = {}) {
  return useQuery({
    queryKey: movimientoKeys.list(params),
    queryFn:  () => getMovimientos(params),
  });
}

export function useMovimiento(id) {
  return useQuery({
    queryKey: movimientoKeys.detail(id),
    queryFn:  () => getMovimiento(id),
    enabled:  !!id,
  });
}

/** Selector de vinculación — lista completa sin paginación. */
export function useMovimientosParaVincular(params = {}) {
  return useQuery({
    queryKey: movimientoKeys.paraVincular(params),
    queryFn:  () => getMovimientosParaVincular(params),
    staleTime: 5 * 60 * 1000, // 5 min; Realtime invalida cuando hay cambios
  });
}

// ── FACTURAS / DOCUMENTOS ────────────────────────────────────────────────────

export function useFacturas(params = {}) {
  return useQuery({
    queryKey: facturaKeys.list(params),
    queryFn:  () => getFacturas(params),
  });
}

export function useFactura(id) {
  return useQuery({
    queryKey: facturaKeys.detail(id),
    queryFn:  () => getFactura(id),
    enabled:  !!id,
  });
}

/** Selector de vinculación. */
export function useFacturasParaVincular(params = {}) {
  return useQuery({
    queryKey: facturaKeys.paraVincular(params),
    queryFn:  () => getFacturasParaVincular(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

export function useDashboard(params = {}) {
  return useQuery({
    queryKey: dashboardKeys.data(params),
    queryFn:  () => getDashboard(params),
  });
}

// ── FISCAL ───────────────────────────────────────────────────────────────────

export function useFiscal(params = {}) {
  return useQuery({
    queryKey: fiscalKeys.data(params),
    queryFn:  () => getFiscal(params),
    enabled:  !!params.anio,
  });
}

// ── CONTACTOS ────────────────────────────────────────────────────────────────

export function useClientesLista() {
  return useQuery({
    queryKey: contactoKeys.lista('cliente'),
    queryFn:  getClientesLista,
    staleTime: 10 * 60 * 1000, // contactos cambian poco
  });
}

export function useEquipoLista() {
  return useQuery({
    queryKey: contactoKeys.lista('equipo'),
    queryFn:  getEquipoLista,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProveedoresLista() {
  return useQuery({
    queryKey: contactoKeys.lista('proveedor'),
    queryFn:  getProveedoresLista,
    staleTime: 10 * 60 * 1000,
  });
}

export function useContactosTodos() {
  return useQuery({
    queryKey: contactoKeys.todos(),
    queryFn:  getContactosTodos,
    staleTime: 10 * 60 * 1000,
  });
}

export function useClientes(params = {}) {
  return useQuery({
    queryKey: contactoKeys.clientes(params),
    queryFn:  () => getClientes(params),
  });
}

export function useEquipo(params = {}) {
  return useQuery({
    queryKey: contactoKeys.equipo(params),
    queryFn:  () => getEquipo(params),
  });
}

export function useProveedores(params = {}) {
  return useQuery({
    queryKey: contactoKeys.proveedores(params),
    queryFn:  () => getProveedores(params),
  });
}
