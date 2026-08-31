/**
 * Wrappers de fetch para todos los endpoints de Finanzas.
 *
 * - Cada función obtiene el token fresco y lanza en caso de error HTTP.
 * - No mantienen estado. Son funciones puras async → data.
 * - Los hooks useQuery/useMutation de TanStack Query las invocan como queryFn/mutationFn.
 * - No duplican endpoints: usan los mismos que Finanzas.jsx actualmente.
 */

import { getToken } from '@/lib/supabaseClient';
import { BACKEND_URL } from '@/lib/config';

async function authFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── MOVIMIENTOS ──────────────────────────────────────────────────────────────

export function getMovimientos(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/movimientos${qs ? `?${qs}` : ''}`);
}

export function getMovimiento(id) {
  return authFetch(`/admin/finanzas/movimientos/${id}`);
}

/** Lista completa de movimientos para el selector de vinculación (sin paginación). */
export function getMovimientosParaVincular(params = {}) {
  const merged = { todos: '1', ...params };
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/movimientos?${qs}`);
}

export function createMovimiento(data) {
  return authFetch('/admin/finanzas/movimiento', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMovimiento(id, data) {
  return authFetch(`/admin/finanzas/movimiento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteMovimiento(id) {
  return authFetch(`/admin/finanzas/movimiento/${id}`, { method: 'DELETE' });
}

export function bulkDeleteMovimientos(ids) {
  return authFetch('/admin/finanzas/movimientos/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function bulkEditMovimientos(ids, cambios) {
  return authFetch('/admin/finanzas/movimientos/bulk-edit', {
    method: 'PUT',
    body: JSON.stringify({ ids, cambios }),
  });
}

/** Reemplaza todas las facturas vinculadas a un movimiento. */
export function setFacturasMovimiento(movimientoId, facturaIds) {
  return authFetch(`/admin/finanzas/movimiento/${movimientoId}/facturas`, {
    method: 'PUT',
    body: JSON.stringify({ factura_ids: facturaIds }),
  });
}

// ── FACTURAS / DOCUMENTOS ────────────────────────────────────────────────────

export function getFacturas(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/facturas${qs ? `?${qs}` : ''}`);
}

export function getFactura(id) {
  return authFetch(`/admin/finanzas/facturas/${id}`);
}

/** Lista completa de facturas para el selector de vinculación. */
export function getFacturasParaVincular(params = {}) {
  return getFacturas(params);
}

/**
 * Guarda el lote de facturas ya extraídas y confirmadas por el usuario.
 * Equivale a POST /admin/finanzas/facturas (handleGuardarFacturas).
 * El flujo previo (extracción OCR → confirmación de contactos) sigue en Finanzas.jsx
 * hasta que se migre en su fase correspondiente.
 */
export function guardarFacturas(facturas) {
  return authFetch('/admin/finanzas/facturas', {
    method: 'POST',
    body: JSON.stringify({ facturas }),
  });
}

/**
 * NOTA: POST /admin/finanzas/facturas/extraer (handleExtraerFactura) recibe
 * archivos multipart (multer). Se ha dejado conscientemente fuera de esta capa
 * por ahora: el flujo de subida de ficheros requiere pasar FormData directamente
 * y tiene estado transitorio complejo (progreso, cola, errores por archivo).
 * Se migrará en la fase de facturas cuando se aborde el flujo completo de subida.
 */

export function updateFactura(id, data) {
  return authFetch(`/admin/finanzas/facturas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFactura(id) {
  return authFetch(`/admin/finanzas/facturas/${id}`, { method: 'DELETE' });
}

/** Reemplaza todos los movimientos vinculados a una factura. */
export function setMovimientosFactura(facturaId, movimientoIds) {
  return authFetch(`/admin/finanzas/facturas/${facturaId}/movimientos`, {
    method: 'PUT',
    body: JSON.stringify({ movimiento_ids: movimientoIds }),
  });
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

export function getDashboard(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/dashboard${qs ? `?${qs}` : ''}`);
}

// ── FISCAL ───────────────────────────────────────────────────────────────────

export function getFiscal(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/fiscal${qs ? `?${qs}` : ''}`);
}

export function getMovimientosConFactura(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/movimientos-con-factura${qs ? `?${qs}` : ''}`);
}

// ── CONTACTOS ────────────────────────────────────────────────────────────────

/** Listas ligeras para selectores (id + nombre). */
export function getClientesLista() {
  return authFetch('/admin/finanzas/clientes/lista');
}
export function getEquipoLista() {
  return authFetch('/admin/finanzas/equipo/lista');
}
export function getProveedoresLista() {
  return authFetch('/admin/finanzas/proveedores/lista');
}

/** Todos los contactos (para matching de huérfanas). */
export function getContactosTodos() {
  return authFetch('/admin/finanzas/contactos/todos');
}

/** Listas paginadas/completas de cada rol. */
export function getClientes(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/clientes${qs ? `?${qs}` : ''}`);
}
export function getEquipo(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/equipo${qs ? `?${qs}` : ''}`);
}
export function getProveedores(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return authFetch(`/admin/finanzas/proveedores${qs ? `?${qs}` : ''}`);
}

export function createCliente(data) {
  return authFetch('/admin/finanzas/clientes', { method: 'POST', body: JSON.stringify(data) });
}
export function updateCliente(id, data) {
  return authFetch(`/admin/finanzas/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function createEquipo(data) {
  return authFetch('/admin/finanzas/equipo', { method: 'POST', body: JSON.stringify(data) });
}
export function updateEquipo(id, data) {
  return authFetch(`/admin/finanzas/equipo/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function createProveedor(data) {
  return authFetch('/admin/finanzas/proveedores', { method: 'POST', body: JSON.stringify(data) });
}
export function updateProveedor(id, data) {
  return authFetch(`/admin/finanzas/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteContacto(id) {
  return authFetch(`/admin/finanzas/contactos/${id}`, { method: 'DELETE' });
}
