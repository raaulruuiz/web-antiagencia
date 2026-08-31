/**
 * Query keys centralizadas para el módulo Finanzas.
 *
 * Jerarquía:
 *   movimientoKeys.all          → invalida TODO lo relacionado con movimientos
 *   movimientoKeys.lists()      → invalida todas las listas (paginadas, filtradas)
 *   movimientoKeys.list(params) → invalida una lista concreta (por filtros/página)
 *   movimientoKeys.detail(id)   → invalida el detalle de un movimiento
 *   movimientoKeys.paraVincular → invalida el selector de movimientos para vincular
 *
 * Uso en invalidación:
 *   queryClient.invalidateQueries({ queryKey: movimientoKeys.all })
 *   → invalida listas + detalles + paraVincular en un solo dispatch
 */

export const movimientoKeys = {
  all:              ['movimientos'],
  lists:            ()       => ['movimientos', 'list'],
  list:             (params) => ['movimientos', 'list', params],
  detail:           (id)     => ['movimientos', 'detail', id],
  paraVincularAll:  ()       => ['movimientos', 'para-vincular'],
  paraVincular:     (params) => ['movimientos', 'para-vincular', params ?? {}],
};

export const facturaKeys = {
  all:              ['facturas'],
  lists:            ()       => ['facturas', 'list'],
  list:             (params) => ['facturas', 'list', params],
  detail:           (id)     => ['facturas', 'detail', id],
  paraVincularAll:  ()       => ['facturas', 'para-vincular'],
  paraVincular:     (params) => ['facturas', 'para-vincular', params ?? {}],
};

export const dashboardKeys = {
  all:  ['dashboard'],
  data: (params) => ['dashboard', params ?? {}],
};

export const fiscalKeys = {
  all:  ['fiscal'],
  data: (params) => ['fiscal', params ?? {}],
};

export const contactoKeys = {
  all:       ['contactos'],
  lista:     (rol) => ['contactos', 'lista', rol],          // listas ligeras para selectores
  clientes:  (params) => ['contactos', 'clientes', params ?? {}],
  equipo:    (params) => ['contactos', 'equipo',   params ?? {}],
  proveedores:(params)=> ['contactos', 'proveedores', params ?? {}],
  todos:     ()       => ['contactos', 'todos'],
};
