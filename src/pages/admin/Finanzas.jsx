import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMovimientos,
  useMovimiento,
  useMovimientosParaVincular, useFacturasParaVincular,
  useCrearMovimiento, useEditarMovimiento, useEliminarMovimiento,
  useBulkDeleteMovimientos, useBulkEditMovimientos,
  useSetFacturasMovimiento, useToggleMovimientoEnFactura,
  movimientoKeys,
  useFacturas,
  useFactura,
  facturaKeys,
  useDashboard,
  dashboardKeys,
  useFiscal,
  useGuardarFacturas,
  useEliminarFactura,
  useBulkDeleteFacturas,
  useFinanzasRealtime,
  useClientesLista, useEquipoLista, useProveedoresLista, useContactosTodos,
  useClientes, useEquipo, useProveedores,
  useCrearCliente, useEditarCliente,
  useCrearEquipo, useEditarEquipo,
  useCrearProveedor, useEditarProveedor,
  useEliminarContacto,
  contactoKeys,
} from '@/features/finanzas';
import { BACKEND_URL } from '@/lib/config';
import { RANGOS_PRESET, lsGet, lsSet, getToken } from '@/features/finanzas/utils';
import { ModalEditar } from '@/features/finanzas/components/ModalEditar';
import { ModalMovimiento } from '@/features/finanzas/components/ModalMovimiento';
import { SplitViewModal } from '@/features/finanzas/components/SplitViewModal';
import { ModalContacto } from '@/features/finanzas/components/ModalContacto';
import { TabFiscal } from '@/features/finanzas/components/TabFiscal';
import { NuevoMovimientoTab } from '@/features/finanzas/components/NuevoMovimientoTab';
import { DashboardTab } from '@/features/finanzas/components/DashboardTab';
import { MovimientosTab } from '@/features/finanzas/components/MovimientosTab';
import { DocumentosTab } from '@/features/finanzas/components/DocumentosTab';
import { ClientesTab } from '@/features/finanzas/components/ClientesTab';
import { EquipoTab } from '@/features/finanzas/components/EquipoTab';
import { ProveedoresTab } from '@/features/finanzas/components/ProveedoresTab';
import { ModalNuevosContactos } from '@/features/finanzas/components/ModalNuevosContactos';
import { ModalDocumentoViewer } from '@/features/finanzas/components/ModalDocumentoViewer';

export default function Finanzas() {
  const initAnio = RANGOS_PRESET().find(p => p.label === 'Año hasta la fecha');
  const [desde, setDesde] = useState(() => lsGet('fin_desde', initAnio.desde));
  const [hasta, setHasta] = useState(() => lsGet('fin_hasta', initAnio.hasta));
  const [tab, setTab]     = useState(() => lsGet('fin_tab', 'dashboard'));
  const [comparar, setComparar]   = useState(() => lsGet('fin_comparar', false));
  const [desdeComp, setDesdeComp] = useState(() => lsGet('fin_desdeComp', ''));
  const [hastaComp, setHastaComp] = useState(() => lsGet('fin_hastaComp', ''));
  const [viewCat, setViewCat] = useState('total');
  const [viewEvol, setViewEvol] = useState('barras');
  const [viewCuenta, setViewCuenta] = useState('barras');
  const [zoomEvol, setZoomEvol] = useState(0);
  const [zoomCuenta, setZoomCuenta] = useState(0);
  const [clienteAbierto, setClienteAbierto] = useState(null);
  const [equipoAbierto, setEquipoAbierto] = useState(null);
  const [equipoBusqueda, setEquipoBusqueda] = useState('');
  const [equipoSort, setEquipoSort] = useState({ campo: 'beneficio', dir: 'asc' });
  const [movFiltroTipo, setMovFiltroTipo] = useState('todos');
  const [movPagina, setMovPagina] = useState(1);
  const [movPorPagina, setMovPorPagina] = useState(10);
  const [docContactoPagina, setDocContactoPagina] = useState(1);
  const [docContactoPorPagina, setDocContactoPorPagina] = useState(10);
  const [movBusqueda, setMovBusqueda] = useState('');
  const [clienteSort, setClienteSort] = useState({ campo: 'beneficio', dir: 'desc' });
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  // Modal contacto (cliente / equipo)
  const [modalContacto, setModalContacto] = useState(null); // null | { tipo: 'cliente'|'equipo', datos: {} | null }
  const [proveedorAbierto, setProveedorAbierto] = useState(null);
  const [proveedorBusqueda, setProveedorBusqueda] = useState('');
  const [proveedorSort, setProveedorSort] = useState({ campo: 'gasto', dir: 'desc' });
  // Tabs internas en filas expandibles (Movimientos / Documentos)
  const [contactoTabInner, setContactoTabInner] = useState('movimientos');
  const [docFiltroTipo, setDocFiltroTipo] = useState('todos');
  // Modal nuevos contactos detectados al guardar facturas
  const [modalNuevosContactos, setModalNuevosContactos] = useState(null); // null | array
  const [confirmandoContactos, setConfirmandoContactos] = useState(false);
  // Tab Documentos (main)
  const [vistaDocumentos, setVistaDocumentos] = useState('tabla');
  const [docConflictosFiltro, setDocConflictosFiltro] = useState('todos');
  const [docConflictosResueltos, setDocConflictosResueltos] = useState(new Set());
  const [docSplitView, setDocSplitView] = useState(null); // { movimiento, factura } para ver ambos desde conflictos
  const [docTabDesde, setDocTabDesde] = useState(() => lsGet('fin_doc_desde', '2023-01-01'));
  const [docTabHasta, setDocTabHasta] = useState(() => lsGet('fin_doc_hasta', new Date().toISOString().slice(0,10)));
  // documentosList y loadingDocumentos → migrados a TanStack Query en Fase 5 (ver facturasQuery más abajo)
  const [docTabBusqueda, setDocTabBusqueda] = useState('');
  const [docTabTipo, setDocTabTipo] = useState('todos');
  const [docTabSort, setDocTabSort] = useState({ campo: 'fecha_factura', dir: 'desc' });
  const [docTabEditando, setDocTabEditando] = useState(null); // { id, campo, valor }
  const [docFiltros, setDocFiltros] = useState([]);
  const [docFiltroOp, setDocFiltroOp] = useState('and');
  const [docSorts, setDocSorts] = useState([]);
  const [docPanelFiltro, setDocPanelFiltro] = useState(false);
  const [docPanelOrdenar, setDocPanelOrdenar] = useState(false);
  const [docSeleccionados, setDocSeleccionados] = useState(new Set());
  const [docPagina, setDocPagina] = useState(1);
  const [docLimit, setDocLimit] = useState(50);
  const [docMostrarTodos, setDocMostrarTodos] = useState(false);
  const [docColCalcs, setDocColCalcs] = useState({});
  const [docOpenCalcKey, setDocOpenCalcKey] = useState(null);
  const [docCalcDropPos, setDocCalcDropPos] = useState(null);
  const [docEliminandoBulk, setDocEliminandoBulk] = useState(false);
  const [docBulkProveedor, setDocBulkProveedor] = useState('');
  const [docBulkCliente, setDocBulkCliente] = useState('');
  const [docHoveredRow, setDocHoveredRow] = useState(null);
  const [evolHidden, setEvolHidden] = useState({});
  const [catHidden, setCatHidden] = useState({});
  const [ctaHidden, setCtaHidden] = useState({});
  const toggleEvol = k => setEvolHidden(h => ({ ...h, [k]: !h[k] }));
  const toggleCat  = k => setCatHidden(h  => ({ ...h, [k]: !h[k] }));
  const toggleCta  = k => setCtaHidden(h  => ({ ...h, [k]: !h[k] }));
  const scrollEvolRef = useRef(null);
  const xAxisEvolRef  = useRef(null);
  const scrollCtaRef  = useRef(null);
  const xAxisCtaRef   = useRef(null);
  const [movFiltros, setMovFiltros]     = useState([]);
  const [movFiltroOp, setMovFiltroOp]   = useState('and');
  const [movSorts, setMovSorts]         = useState([]);
  const [panelFiltro, setPanelFiltro]   = useState(false);
  const [panelOrdenar, setPanelOrdenar] = useState(false);
  const [pagMovs, setPagMovs] = useState(1);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [movEditando, setMovEditando] = useState(null);
  const [movDetailId, setMovDetailId] = useState(null);
  const { data: movDetail, isLoading: movDetailLoading, isError: movDetailError } = useMovimiento(movDetailId);
  const [facturaViewerId, setFacturaViewerId] = useState(null); // UI state: ID del viewer abierto, o null
  const [facturaViewerAutoEdit, setFacturaViewerAutoEdit] = useState(false); // true → abre en modo edición
  const { data: facturaViewerData, isLoading: facturaViewerLoading, isError: facturaViewerError } = useFactura(facturaViewerId);
  const [viewerEditando, setViewerEditando] = useState(false);
  const [viewerDraft, setViewerDraft] = useState({});
  // Resetear estado de edición al cerrar viewer
  useEffect(() => {
    if (!facturaViewerId) { setViewerEditando(false); setViewerDraft({}); setFacturaViewerAutoEdit(false); }
  }, [facturaViewerId]);
  // Cuando llega el dato y hay _autoEdit pendiente, inicializar draft y abrir edición
  useEffect(() => {
    if (!facturaViewerData || !facturaViewerAutoEdit) return;
    const fv = facturaViewerData;
    setViewerEditando(true);
    setViewerDraft({ archivo_nombre: fv.archivo_nombre||'', factura_proveedor_id: fv.factura_proveedor_id||'', factura_cliente_id: fv.factura_cliente_id||'', importe: fv.importe??'', impuesto: fv.impuesto??'', irpf: fv.irpf??'' });
    setFacturaViewerAutoEdit(false); // consumir flag
  }, [facturaViewerData, facturaViewerAutoEdit]);
  const [sinMovimientosMes, setSinMovimientosMes] = useState(false);
  const { data: filtroClientesLista = [] } = useClientesLista();
  const { data: filtroEquipoLista = [] } = useEquipoLista();
  const { data: filtroProveedoresLista = [] } = useProveedoresLista();
  // movimientosParams useMemo necesita estos dos antes de la sección TQ
  const [vistaMovs, setVistaMovs] = useState(() => { const v = lsGet('fin_vista', 'lista'); return ['lista','tabla','errores'].includes(v) ? v : 'lista'; });
  const [movLimit, setMovLimit] = useState(() => lsGet('fin_limit', 50));
  // ─── Selectores de vinculación (TanStack Query) ──────────────────────────────
  const qc = useQueryClient();
  const _movsPVParams = useMemo(() => {
    const p = {};
    if (desde) p.desde = desde;
    if (hasta) p.hasta = hasta;
    return p;
  }, [desde, hasta]);
  const _movsPVQuery = useMovimientosParaVincular(_movsPVParams);
  const movimientosParaVincular = _movsPVQuery.data?.items ?? [];
  const loadingMovsVincular = _movsPVQuery.isLoading;

  const _facsPVQuery = useFacturasParaVincular({});
  const facturasParaVincular = useMemo(() => {
    const raw = Array.isArray(_facsPVQuery.data) ? _facsPVQuery.data : [];
    return raw.map(f => {
      const total = Math.abs(parseFloat(f.importe_total ?? 0) || 0);
      const subtitulo = [f.nombre_entidad, f.numero_factura, f.fecha_factura, total > 0 ? `${Math.round(total)}€` : null].filter(Boolean).join(' · ');
      return { id: f.id, nombre: f.archivo_nombre || f.nombre_entidad || '—', subtitulo, fecha: f.fecha_factura || '' };
    });
  }, [_facsPVQuery.data]);
  const loadingFacsVincular = _facsPVQuery.isLoading;

  // ─── Lista principal de movimientos (TanStack Query) ─────────────────────────
  // movBusqueda se debouncea 300ms antes de entrar en la queryKey
  const [movBusquedaDebounced, setMovBusquedaDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setPagMovs(1); setMovBusquedaDebounced(movBusqueda.trim()); }, 300);
    return () => clearTimeout(t);
  }, [movBusqueda]);

  const movimientosParams = useMemo(() => {
    const p = { page: pagMovs, desde, hasta };
    // errores siempre carga todo (sin paginar) — no muta mostrarTodos
    if (mostrarTodos || vistaMovs === 'errores') {
      p.todos = '1';
    } else {
      p.limit = movLimit;
    }
    if (movBusquedaDebounced) p.busqueda = movBusquedaDebounced;
    const filtrosValidos = movFiltros.filter(f => {
      if (!f.campo || !f.operador) return false;
      if (['is_null', 'is_not_null'].includes(f.operador)) return true;
      if (Array.isArray(f.valor)) return f.valor.length > 0;
      return f.valor !== '';
    });
    if (filtrosValidos.length > 0) {
      p.filters  = JSON.stringify(filtrosValidos.map(({ campo, operador, valor }) => ({ campo, operador, valor })));
      p.filterOp = movFiltroOp;
    }
    if (movSorts.length > 0) p.sorts = JSON.stringify(movSorts);
    return p;
  }, [pagMovs, desde, hasta, mostrarTodos, vistaMovs, movLimit, movBusquedaDebounced, movFiltros, movFiltroOp, movSorts]);

  const movimientosQuery = useMovimientos(movimientosParams);
  const movimientos   = movimientosQuery.data ?? { items: [], total: 0, page: pagMovs, pages: 1 };
  const loadingMovs   = movimientosQuery.isLoading;
  const errMovs       = movimientosQuery.error?.message ?? null;

  // Fase 5: facturas/documentos como server-state en TanStack Query.
  // documentosList es un alias de lectura — NO hay setDocumentosList.
  const facturasQuery   = useFacturas({ desde: docTabDesde, hasta: docTabHasta });
  const documentosList  = facturasQuery.data ?? [];
  const loadingDocumentos = facturasQuery.isFetching;

  // ─── Fase 8: dashboard como server-state en TanStack Query ───────────────────
  const dashParams = useMemo(() => ({ desde, hasta }), [desde, hasta]);
  const dashCompParams = useMemo(
    () => (comparar && desdeComp && hastaComp ? { desde: desdeComp, hasta: hastaComp } : null),
    [comparar, desdeComp, hastaComp]
  );
  const _dashQuery     = useDashboard(dashParams);
  const _dashCompQuery = useDashboard(dashCompParams ?? {}, { enabled: !!dashCompParams });
  const dashboard  = _dashQuery.data ?? null;
  const loadingDash    = _dashQuery.isLoading;
  const errDash    = _dashQuery.isError ? (_dashQuery.error?.message ?? 'Error al cargar dashboard') : null;
  const dashComp   = dashCompParams ? (_dashCompQuery.data ?? null) : null;
  const loadingComp    = !!dashCompParams && _dashCompQuery.isLoading;

  // ─── Mutations de movimientos ────────────────────────────────────────────────
  const _crearMovMut   = useCrearMovimiento();
  const _editarMovMut  = useEditarMovimiento();
  const _eliminarMovMut = useEliminarMovimiento();
  const _bulkDeleteMut = useBulkDeleteMovimientos();
  const _bulkEditMut   = useBulkEditMovimientos();
  // ─── Mutations de contactos (Fase 11E1) ──────────────────────────────────────
  const _eliminarContactoMut = useEliminarContacto();
  // ─── Mutations de vinculación factura ↔ movimiento (Fase 7) ─────────────────
  const _setFacturasMut  = useSetFacturasMovimiento();    // replace-all desde el lado del movimiento
  const _toggleMovVincMut = useToggleMovimientoEnFactura(); // GET detail + toggle + PUT desde el lado de la factura

  const [docVinculosEditando, setDocVinculosEditando] = useState(null); // factura.id con dropdown abierto
  const [viewerVincOpen, setViewerVincOpen] = useState(false); // dropdown movimientos en el viewer de factura
  const [movsErroresResueltos, setMovsErroresResueltos] = useState(new Set());
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [selTodos, setSelTodos] = useState(false); // todos los del filtro seleccionados
  const [cargandoTodos, setCargandoTodos] = useState(false);
  const [bulkCampo, setBulkCampo] = useState(null);
  const [bulkValor, setBulkValor] = useState('');
  const [bulkValorMulti, setBulkValorMulti] = useState([]); // para cliente_ids / equipo_ids
  const [bulkFiltroLista, setBulkFiltroLista] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null); // { texto, onOk }

  // Persistir en localStorage cuando cambian
  useEffect(() => { lsSet('fin_desde', desde); }, [desde]);
  useEffect(() => { lsSet('fin_hasta', hasta); }, [hasta]);
  useEffect(() => { lsSet('fin_tab', tab); }, [tab]);
  useEffect(() => { lsSet('fin_comparar', comparar); }, [comparar]);
  useEffect(() => { lsSet('fin_desdeComp', desdeComp); }, [desdeComp]);
  useEffect(() => { lsSet('fin_hastaComp', hastaComp); }, [hastaComp]);

  function abrirDetalle(id) {
    setMovDetailId(id || null);
  }

  // URL sync mount — política: ?doc gana sobre ?mov si ambos presentes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('doc');
    const movId = params.get('mov');
    if (docId) {
      setFacturaViewerId(docId);
      // Normalizar URL: eliminar ?mov si coexistía
      if (movId) {
        params.delete('mov');
        const qs = params.toString();
        window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
      }
    } else if (movId) {
      setMovDetailId(movId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza back/forward con la misma política: ?doc gana
  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const docId = params.get('doc') || null;
      const movId = params.get('mov') || null;
      if (docId) {
        setFacturaViewerId(docId);
        setMovDetailId(null);
      } else {
        setFacturaViewerId(null);
        setMovDetailId(movId);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (movDetailId) {
      params.set('mov', movDetailId);
    } else {
      params.delete('mov');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [movDetailId]);

  // URL sync: ?doc=ID ↔ facturaViewerId (write)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (facturaViewerId) {
      params.set('doc', facturaViewerId);
    } else {
      params.delete('doc');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [facturaViewerId]);

  // Fase 5: cargarDocumentos eliminado — la lista de facturas la gestiona facturasQuery (TQ).
  // La detección de huérfanas se hace en un efecto separado; contactosTodos viene de TanStack Query.
  const { data: contactosTodos = [] } = useContactosTodos();
  const _orphanCheckedRef = useRef(false);
  useEffect(() => {
    // Resetear al salir del tab para que re-chequee al volver
    if (tab !== 'documentos') { _orphanCheckedRef.current = false; return; }
    const docs = facturasQuery.data;
    if (!docs?.length || _orphanCheckedRef.current || modalNuevosContactos !== null) return;
    _orphanCheckedRef.current = true;
    const huerfanas = docs.filter(f =>
      (f.tipo === 'gasto' && !f.factura_proveedor_id) ||
      (f.tipo === 'ingreso' && !f.factura_cliente_id)
    );
    if (!huerfanas.length) return;
    const grupos = new Map();
    for (const f of huerfanas) {
      const key = `${f.tipo}||${f.nombre_entidad || ''}`;
      if (!grupos.has(key)) grupos.set(key, { nombre_entidad: f.nombre_entidad || '', nif_cif: f.nif_cif || null, tipo: f.tipo, factura_ids: [], archivo_url: f.archivo_url || null });
      grupos.get(key).factura_ids.push(f.id);
    }
    setModalNuevosContactos([...grupos.values()].map(g => ({
      ...g, _nombre: '', _nombre_empresa: g.nombre_entidad || '', _asignarA: null, _ignorar: false,
      _nif_cif: g.nif_cif || '', _direccion: '', _email: '', _roles: ['proveedor'],
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturasQuery.data, tab, modalNuevosContactos]);


  async function guardarCeldaDoc(id, updates) {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error');
      await res.json(); // descartar — PATCH devuelve columnas sin movimiento_ids
      // Invalidar detail (viewer abierto se actualiza solo via useFactura) + todas las listas
      await qc.invalidateQueries({ queryKey: facturaKeys.detail(id) });
      qc.invalidateQueries({ queryKey: facturaKeys.lists() });
    } catch(e) { console.error(e); alert('Error al guardar: ' + e.message); }
  }

  // Algoritmo de matching compartido: encuentra el mejor movimiento para una factura.
  // Usado tanto en la tab Movimientos (conflictos) como en la tab Fiscal (errores modal).
  const findBestMatch = useCallback((doc) => {
    if (!movimientosParaVincular.length) return null;
    const tokensM = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>=3);
    const facBase = Math.abs(parseFloat(doc.importe_total ?? 0) || 0) || Math.abs(doc.importe || 0);
    const facTipo = doc.tipo; // 'gasto' o 'ingreso'
    const tF = tokensM(doc.nombre_entidad || '');
    // Excluir movimientos ya vinculados a otras facturas
    const vinculados = new Set(documentosList.flatMap(d => d.movimiento_ids || []));
    const docFecha = doc.fecha_factura || null;
    const candidatos = movimientosParaVincular.filter(m => {
      if (vinculados.has(m.id)) return false;
      const mTipo = (m.tipo || '').toLowerCase();
      if (!(facTipo === 'gasto' ? mTipo === 'gasto' : mTipo === 'ingreso')) return false;
      // El cargo siempre es en fecha >= fecha del documento
      if (docFecha && m.fecha && m.fecha < docFecha) return false;
      return true;
    });
    if (!candidatos.length) return null;
    const scored = candidatos.map(m => {
      const mCant = Math.abs(m.cantidad || 0);
      const importeScore = facBase > 0 ? Math.abs(mCant - facBase) / facBase : (mCant > 0 ? 1 : 0);
      const tM = tokensM(m.nombre || '');
      const nameScore = tF.length && tM.length
        ? 1 - (tF.filter(w => tM.some(wm => wm.includes(w) || w.includes(wm))).length / tF.length)
        : 1;
      return { m, score: importeScore * 4 + nameScore * 2, importeScore, nameScore };
    }).sort((a, b) => a.score - b.score);
    const best = scored[0];
    return best && best.importeScore < 0.5 && best.nameScore < 0.9 ? best.m : null;
  }, [movimientosParaVincular, documentosList]);

  // ── refrescarFactura ─────────────────────────────────────────────
  // Fase 6: invalida detail + listas de forma declarativa.
  // El viewer abierto se actualiza automáticamente via useFactura(facturaViewerId).
  // Sigue siendo utilizado por: Realtime handlers, ModalEditar onGuardado.
  function refrescarFactura(facId) {
    qc.invalidateQueries({ queryKey: facturaKeys.detail(facId) });
    qc.invalidateQueries({ queryKey: facturaKeys.lists() });
  }

  // Toggle vínculo movimiento en una factura (desde tabla Documentos, viewer o TabFiscal).
  // Fase 7: GET detail + toggle + PUT centralizado en useToggleMovimientoEnFactura (mutations.js).
  async function toggleMovimientoEnFactura(facturaId, movimientoId) {
    try {
      await _toggleMovVincMut.mutateAsync({ facturaId, movimientoId });
    } catch(e) { console.error(e); }
  }

  // Reemplaza los vínculos de facturas de un movimiento (desde tabla Movimientos).
  // Fase 7: PUT centralizado en useSetFacturasMovimiento (mutations.js).
  // Invalidaciones: movimientoKeys.detail + lists + facturaKeys.all (cubre old ∪ new details).
  async function handleVincularFacturasMovimiento(movimientoId, newFacturaIds) {
    try {
      await _setFacturasMut.mutateAsync({ movimientoId, facturaIds: newFacturaIds });
    } catch(e) { console.error(e); }
  }

  // ─── Supabase Realtime ───────────────────────────────────────────────────────
  // Centralizado en src/features/finanzas/realtime.js
  useFinanzasRealtime();
  // ────────────────────────────────────────────────────────────────────────────

  // Calcula campos fiscales derivados al cambiar proveedor/cliente
  function contactFiscalUpdates(contactId, contacts, docTipo, campo) {
    const isExternal = (docTipo === 'gasto' && campo === 'factura_proveedor_id') ||
                       (docTipo === 'ingreso' && campo === 'factura_cliente_id');
    if (!isExternal || !contactId) return {};
    const c = contacts.find(x => x.id === contactId);
    if (!c) return {};
    return { nombre_entidad: c.nombre_empresa || c.nombre || '', nif_cif: c.nif_cif || '' };
  }

  function toggleDocSel(id) {
    setDocSeleccionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleDocAll(items, allSel) {
    setDocSeleccionados(prev => {
      const s = new Set(prev);
      if (allSel) items.forEach(d => s.delete(d.id));
      else items.forEach(d => s.add(d.id));
      return s;
    });
  }
  async function eliminarDocsBulk() {
    setDocEliminandoBulk(true);
    try {
      const token = await getToken();
      const ids = [...docSeleccionados];
      const results = await Promise.allSettled(ids.map(id => fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      })));
      const deletedIds = ids.filter((_, i) => results[i].status === 'fulfilled' && results[i].value.ok);
      if (deletedIds.length) {
        deletedIds.forEach(id => qc.removeQueries({ queryKey: facturaKeys.detail(id), exact: true }));
        qc.invalidateQueries({ queryKey: facturaKeys.lists() });
        if (deletedIds.includes(facturaViewerId)) setFacturaViewerId(null);
        // Mantener seleccionadas las que fallaron (response !ok o error de red); quitar las eliminadas con éxito
        setDocSeleccionados(new Set(ids.filter((_, i) => !(results[i].status === 'fulfilled' && results[i].value.ok))));
      }
    } catch(e) { console.error(e); }
    finally { setDocEliminandoBulk(false); }
  }

  async function editarDocsBulkContacto(campo, contactId) {
    if (!contactId) return;
    const ctodos = contactosTodos;
    const ids = [...docSeleccionados];
    await Promise.all(ids.map(id => {
      const doc = documentosList.find(d => d.id === id);
      const extra = doc ? contactFiscalUpdates(contactId, ctodos, doc.tipo, campo) : {};
      return guardarCeldaDoc(id, { [campo]: contactId, ...extra });
    }));
    if (campo === 'factura_proveedor_id') setDocBulkProveedor('');
    else setDocBulkCliente('');
  }

  function guardarCeldaInline(id, campo, valor) {
    const data = { [campo]: campo === 'cantidad' ? parseFloat(valor) : valor };
    _editarMovMut.mutate({ id, data }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: contactoKeys.all }); },
      onError: (err) => alert('Error al guardar: ' + err.message),
    });
  }

  function eliminarBulk() {
    if (!seleccionados.size) return;
    setConfirmDialog({
      texto: `¿Eliminar ${seleccionados.size} movimiento${seleccionados.size>1?'s':''}?`,
      onOk: () => {
        const ids = [...seleccionados];
        _bulkDeleteMut.mutate(ids, {
          onSuccess: () => { setSeleccionados(new Set()); },
        });
      },
    });
  }

  function editarBulk(campo, valor) {
    if (!seleccionados.size || !valor) return;
    const ids = [...seleccionados];
    _bulkEditMut.mutate({ ids, cambios: { [campo]: valor } }, {
      onSuccess: () => { setBulkCampo(null); setBulkValor(''); qc.invalidateQueries({ queryKey: contactoKeys.all }); },
      onError:   (err) => alert('Error al editar en bloque: ' + err.message),
    });
  }

  function toggleSel(id) { setSelTodos(false); setSeleccionados(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; }); }
  function toggleAll(items, allSel) {
    setSelTodos(false);
    setSeleccionados(prev => {
      const s = new Set(prev);
      if (allSel) items.forEach(m => s.delete(m.id));
      else items.forEach(m => s.add(m.id));
      return s;
    });
  }

  async function seleccionarTodosLosMovimientos() {
    setCargandoTodos(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ limit: 99999, page: 1 });
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      if (movFiltros.length) params.set('filtros', JSON.stringify(movFiltros));
      if (movFiltroOp) params.set('filtroOp', movFiltroOp);
      if (movSorts.length) params.set('sorts', JSON.stringify(movSorts));
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      const ids = (data.items || []).map(m => m.id);
      setSeleccionados(new Set(ids));
      setSelTodos(true);
    } catch (e) { console.error(e); }
    finally { setCargandoTodos(false); }
  }

  function eliminarMovimiento(id) {
    _eliminarMovMut.mutate(id, {
      onSuccess: () => {
        if (movDetailId === id) setMovDetailId(null);
      },
      onError: (e) => alert('Error al eliminar: ' + e.message),
    });
  }

  function handleApplyDashboard(d, h, doComp, dComp, hComp) {
    setDesde(d); setHasta(h);
    setComparar(doComp);
    if (doComp) { setDesdeComp(dComp); setHastaComp(hComp); }
  }

  function handleApplyMovimientos(d, h) {
    setDesde(d); setHasta(h); setPagMovs(1);
  }


  useEffect(() => {
    async function checkMovimientosMesActual() {
      try {
        const token = await getToken();
        const hoy = new Date();
        const desdeActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
        const nextMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        const hastaActual = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?desde=${desdeActual}&hasta=${hastaActual}&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        setSinMovimientosMes(r.ok && data.total === 0);
      } catch { /* silencioso */ }
    }
    checkMovimientosMesActual();
  }, [dashboard]);
  // errores siempre carga todos vía movimientosParams (vistaMovs === 'errores') — sin mutar mostrarTodos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Fase 5: al entrar en tab Documentos, invalidar para asegurar datos frescos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'documentos') qc.invalidateQueries({ queryKey: facturaKeys.lists() }); }, [tab]);

  const _clientesQuery = useClientes({ desde, hasta }, { enabled: tab === 'clientes' });
  const clientes = _clientesQuery.data?.clientes ?? [];
  const loadingClientes = _clientesQuery.isLoading;

  const _equipoQuery = useEquipo({ desde, hasta }, { enabled: tab === 'equipo' });
  const equipo = _equipoQuery.data?.equipo ?? [];
  const loadingEquipo = _equipoQuery.isLoading;

  const _proveedoresQuery = useProveedores({ desde, hasta }, { enabled: tab === 'proveedores' });
  const proveedores = _proveedoresQuery.data?.proveedores ?? [];
  const loadingProveedores = _proveedoresQuery.isLoading;

  function eliminarContacto(id) {
    _eliminarContactoMut.mutate(id, {
      onError: (err) => alert('Error eliminando: ' + err.message),
    });
  }

  const tabStyle = (t) => ({
    background: tab === t ? '#27272a' : 'transparent',
    color: tab === t ? 'white' : '#71717a',
    border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 14, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
  });

  const d = dashboard;

  return (
    <div style={{ padding: '16px', maxWidth: 1140, fontFamily: 'inherit' }}>
      {/* Modal edición */}
      {movEditando && (
        <ModalEditar
          movimiento={movEditando}
          onGuardado={(data) => {
            if (data && movEditando) {
              const oldFacturaIds = movEditando.factura_ids || [];
              const newFacturaIds = data.factura_ids || [];
              const facAfectadas = [...new Set([...oldFacturaIds, ...newFacturaIds])];
              // Re-fetch todas las facturas afectadas desde DB
              facAfectadas.forEach(fid => refrescarFactura(fid));
            }
            qc.invalidateQueries({ queryKey: movimientoKeys.all });
            qc.invalidateQueries({ queryKey: dashboardKeys.all });
          }}
          onCerrar={() => setMovEditando(null)}
        />
      )}

      {/* Modal detalle */}
      {movDetailId && (
        <ModalMovimiento
          m={movDetail}
          isLoading={movDetailLoading}
          isError={movDetailError}
          onClose={() => setMovDetailId(null)}
          onEditar={m => { setMovDetailId(null); setMovEditando(m); }}
          onEliminar={id => { setMovDetailId(null); eliminarMovimiento(id); }}
          onConfirm={setConfirmDialog}
          onAbrirFactura={facId => {
            setMovDetailId(null);
            setFacturaViewerId(facId);
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Finanzas</h1>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Ingresos, gastos, saldos y fiscalidad</p>
      </div>

      {/* Alerta trackeo */}
      {sinMovimientosMes && (
        <div style={{ background: '#1c1007', border: '1px solid #92400e', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>Tienes que trackear, no lo olvides</span>
          <span style={{ color: '#78716c', fontSize: 13, marginLeft: 4 }}>— este mes todavía no hay ningún movimiento registrado.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabStyle('dashboard')}   onClick={() => setTab('dashboard')}>Dashboard</button>
        <button style={tabStyle('movimientos')} onClick={() => setTab('movimientos')}>Movimientos</button>
        <button style={tabStyle('documentos')}  onClick={() => setTab('documentos')}>Documentos</button>
        <button style={tabStyle('fiscal')}      onClick={() => setTab('fiscal')}>Fiscal</button>
        <button style={tabStyle('clientes')}    onClick={() => setTab('clientes')}>Clientes</button>
        <button style={tabStyle('equipo')}      onClick={() => setTab('equipo')}>Equipo</button>
        <button style={tabStyle('proveedores')} onClick={() => setTab('proveedores')}>Proveedores</button>
        <button onClick={() => setTab('nuevo')}
          style={{ background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
          + Nuevo
        </button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
      <DashboardTab
          desde={desde}
          hasta={hasta}
          comparar={comparar}
          desdeComp={desdeComp}
          hastaComp={hastaComp}
          dashboard={dashboard}
          dashComp={dashComp}
          loadingDash={loadingDash}
          loadingComp={loadingComp}
          errDash={errDash}
          handleApplyDashboard={handleApplyDashboard}
          viewCat={viewCat}
          setViewCat={setViewCat}
          viewEvol={viewEvol}
          setViewEvol={setViewEvol}
          viewCuenta={viewCuenta}
          setViewCuenta={setViewCuenta}
          zoomEvol={zoomEvol}
          setZoomEvol={setZoomEvol}
          zoomCuenta={zoomCuenta}
          setZoomCuenta={setZoomCuenta}
          evolHidden={evolHidden}
          catHidden={catHidden}
          ctaHidden={ctaHidden}
          toggleEvol={toggleEvol}
          toggleCat={toggleCat}
          toggleCta={toggleCta}
          scrollEvolRef={scrollEvolRef}
          xAxisEvolRef={xAxisEvolRef}
          scrollCtaRef={scrollCtaRef}
          xAxisCtaRef={xAxisCtaRef}
      />
      )}

      {/* ── MOVIMIENTOS ── */}
      {tab === 'movimientos' && (
      <MovimientosTab
          desde={desde}
          hasta={hasta}
          qc={qc}
          handleApplyMovimientos={handleApplyMovimientos}
          handleVincularFacturasMovimiento={handleVincularFacturasMovimiento}
          seleccionarTodosLosMovimientos={seleccionarTodosLosMovimientos}
          guardarCeldaInline={guardarCeldaInline}
          eliminarBulk={eliminarBulk}
          editarBulk={editarBulk}
          toggleSel={toggleSel}
          toggleAll={toggleAll}
          abrirDetalle={abrirDetalle}
          filtroClientesLista={filtroClientesLista}
          filtroEquipoLista={filtroEquipoLista}
          filtroProveedoresLista={filtroProveedoresLista}
          facturasParaVincular={facturasParaVincular}
          loadingFacsVincular={loadingFacsVincular}
          movimientos={movimientos}
          loadingMovs={loadingMovs}
          errMovs={errMovs}
          pagMovs={pagMovs}
          setPagMovs={setPagMovs}
          movBusqueda={movBusqueda}
          setMovBusqueda={setMovBusqueda}
          movFiltros={movFiltros}
          setMovFiltros={setMovFiltros}
          movFiltroOp={movFiltroOp}
          setMovFiltroOp={setMovFiltroOp}
          movSorts={movSorts}
          setMovSorts={setMovSorts}
          panelFiltro={panelFiltro}
          setPanelFiltro={setPanelFiltro}
          panelOrdenar={panelOrdenar}
          setPanelOrdenar={setPanelOrdenar}
          mostrarTodos={mostrarTodos}
          setMostrarTodos={setMostrarTodos}
          vistaMovs={vistaMovs}
          setVistaMovs={setVistaMovs}
          movLimit={movLimit}
          setMovLimit={setMovLimit}
          seleccionados={seleccionados}
          setSeleccionados={setSeleccionados}
          selTodos={selTodos}
          setSelTodos={setSelTodos}
          cargandoTodos={cargandoTodos}
          bulkCampo={bulkCampo}
          setBulkCampo={setBulkCampo}
          bulkValor={bulkValor}
          setBulkValor={setBulkValor}
          bulkValorMulti={bulkValorMulti}
          setBulkValorMulti={setBulkValorMulti}
          bulkFiltroLista={bulkFiltroLista}
          setBulkFiltroLista={setBulkFiltroLista}
          movsErroresResueltos={movsErroresResueltos}
          setMovsErroresResueltos={setMovsErroresResueltos}      />
      )}

      {/* ── DOCUMENTOS ── */}
      {tab === 'documentos' && (
      <DocumentosTab
          qc={qc}
          contactosTodos={contactosTodos}
          findBestMatch={findBestMatch}
          abrirDetalle={abrirDetalle}
          guardarCeldaDoc={guardarCeldaDoc}
          toggleMovimientoEnFactura={toggleMovimientoEnFactura}
          movimientosParaVincular={movimientosParaVincular}
          loadingMovsVincular={loadingMovsVincular}
          editarDocsBulkContacto={editarDocsBulkContacto}
          contactFiscalUpdates={contactFiscalUpdates}
          eliminarDocsBulk={eliminarDocsBulk}
          toggleDocSel={toggleDocSel}
          toggleDocAll={toggleDocAll}
          setFacturaViewerId={setFacturaViewerId}
          setDocSplitView={setDocSplitView}
          documentosList={documentosList}
          loadingDocumentos={loadingDocumentos}
          vistaDocumentos={vistaDocumentos}
          setVistaDocumentos={setVistaDocumentos}
          docConflictosFiltro={docConflictosFiltro}
          setDocConflictosFiltro={setDocConflictosFiltro}
          docConflictosResueltos={docConflictosResueltos}
          setDocConflictosResueltos={setDocConflictosResueltos}
          docTabDesde={docTabDesde}
          setDocTabDesde={setDocTabDesde}
          docTabHasta={docTabHasta}
          setDocTabHasta={setDocTabHasta}
          docTabBusqueda={docTabBusqueda}
          setDocTabBusqueda={setDocTabBusqueda}
          docTabTipo={docTabTipo}
          docTabEditando={docTabEditando}
          setDocTabEditando={setDocTabEditando}
          docFiltros={docFiltros}
          setDocFiltros={setDocFiltros}
          docFiltroOp={docFiltroOp}
          setDocFiltroOp={setDocFiltroOp}
          docSorts={docSorts}
          setDocSorts={setDocSorts}
          docPanelFiltro={docPanelFiltro}
          setDocPanelFiltro={setDocPanelFiltro}
          docPanelOrdenar={docPanelOrdenar}
          setDocPanelOrdenar={setDocPanelOrdenar}
          docSeleccionados={docSeleccionados}
          setDocSeleccionados={setDocSeleccionados}
          docPagina={docPagina}
          setDocPagina={setDocPagina}
          docLimit={docLimit}
          setDocLimit={setDocLimit}
          docMostrarTodos={docMostrarTodos}
          setDocMostrarTodos={setDocMostrarTodos}
          docColCalcs={docColCalcs}
          docOpenCalcKey={docOpenCalcKey}
          setDocOpenCalcKey={setDocOpenCalcKey}
          docCalcDropPos={docCalcDropPos}
          setDocCalcDropPos={setDocCalcDropPos}
          docEliminandoBulk={docEliminandoBulk}
          docBulkProveedor={docBulkProveedor}
          setDocBulkProveedor={setDocBulkProveedor}
          docBulkCliente={docBulkCliente}
          setDocBulkCliente={setDocBulkCliente}
          docHoveredRow={docHoveredRow}
          setDocHoveredRow={setDocHoveredRow}
          docVinculosEditando={docVinculosEditando}
          setDocVinculosEditando={setDocVinculosEditando}      />
      )}

      {/* ── FISCAL ── */}
      {tab === 'fiscal' && <TabFiscal onAbrirMovimiento={abrirDetalle} facturaViewerData={facturaViewerData} setFacturaViewerId={setFacturaViewerId} setFacturaViewerAutoEdit={setFacturaViewerAutoEdit} onFacturasEliminadas={ids => { ids.forEach(id => qc.removeQueries({ queryKey: facturaKeys.detail(id), exact: true })); qc.invalidateQueries({ queryKey: facturaKeys.lists() }); if (ids.includes(facturaViewerId)) setFacturaViewerId(null); }} findBestMatch={findBestMatch} toggleMovimientoEnFactura={toggleMovimientoEnFactura} setModalNuevosContactos={setModalNuevosContactos} />}

      {/* ── CLIENTES ── */}
      {tab === 'clientes' && (
      <ClientesTab
          desde={desde}
          setDesde={setDesde}
          hasta={hasta}
          setHasta={setHasta}
          clientes={clientes}
          loadingClientes={loadingClientes}
          clienteAbierto={clienteAbierto}
          setClienteAbierto={setClienteAbierto}
          clienteBusqueda={clienteBusqueda}
          setClienteBusqueda={setClienteBusqueda}
          clienteSort={clienteSort}
          setClienteSort={setClienteSort}
          eliminarContacto={eliminarContacto}
          setModalContacto={setModalContacto}
          setConfirmDialog={setConfirmDialog}
          abrirDetalle={abrirDetalle}
          setFacturaViewerId={setFacturaViewerId}
          contactoTabInner={contactoTabInner}
          setContactoTabInner={setContactoTabInner}
          movFiltroTipo={movFiltroTipo}
          setMovFiltroTipo={setMovFiltroTipo}
          movPagina={movPagina}
          setMovPagina={setMovPagina}
          movPorPagina={movPorPagina}
          setMovPorPagina={setMovPorPagina}
          docFiltroTipo={docFiltroTipo}
          setDocFiltroTipo={setDocFiltroTipo}
          docContactoPagina={docContactoPagina}
          setDocContactoPagina={setDocContactoPagina}
          docContactoPorPagina={docContactoPorPagina}
          setDocContactoPorPagina={setDocContactoPorPagina}      />
      )}

      {/* ── EQUIPO ── */}
      {tab === 'equipo' && (
      <EquipoTab
          desde={desde}
          setDesde={setDesde}
          hasta={hasta}
          setHasta={setHasta}
          equipo={equipo}
          loadingEquipo={loadingEquipo}
          equipoAbierto={equipoAbierto}
          setEquipoAbierto={setEquipoAbierto}
          equipoBusqueda={equipoBusqueda}
          setEquipoBusqueda={setEquipoBusqueda}
          equipoSort={equipoSort}
          setEquipoSort={setEquipoSort}
          eliminarContacto={eliminarContacto}
          setModalContacto={setModalContacto}
          setConfirmDialog={setConfirmDialog}
          abrirDetalle={abrirDetalle}
          setFacturaViewerId={setFacturaViewerId}
          contactoTabInner={contactoTabInner}
          setContactoTabInner={setContactoTabInner}
          movFiltroTipo={movFiltroTipo}
          setMovFiltroTipo={setMovFiltroTipo}
          movPagina={movPagina}
          setMovPagina={setMovPagina}
          movPorPagina={movPorPagina}
          setMovPorPagina={setMovPorPagina}
          docFiltroTipo={docFiltroTipo}
          setDocFiltroTipo={setDocFiltroTipo}
          docContactoPagina={docContactoPagina}
          setDocContactoPagina={setDocContactoPagina}
          docContactoPorPagina={docContactoPorPagina}
          setDocContactoPorPagina={setDocContactoPorPagina}      />
      )}

      {/* ── PROVEEDORES ── */}
      {tab === 'proveedores' && (
      <ProveedoresTab
          desde={desde}
          setDesde={setDesde}
          hasta={hasta}
          setHasta={setHasta}
          proveedores={proveedores}
          loadingProveedores={loadingProveedores}
          proveedorAbierto={proveedorAbierto}
          setProveedorAbierto={setProveedorAbierto}
          proveedorBusqueda={proveedorBusqueda}
          setProveedorBusqueda={setProveedorBusqueda}
          proveedorSort={proveedorSort}
          setProveedorSort={setProveedorSort}
          eliminarContacto={eliminarContacto}
          setModalContacto={setModalContacto}
          setConfirmDialog={setConfirmDialog}
          abrirDetalle={abrirDetalle}
          setFacturaViewerId={setFacturaViewerId}
          contactoTabInner={contactoTabInner}
          setContactoTabInner={setContactoTabInner}
          movFiltroTipo={movFiltroTipo}
          setMovFiltroTipo={setMovFiltroTipo}
          movPagina={movPagina}
          setMovPagina={setMovPagina}
          movPorPagina={movPorPagina}
          setMovPorPagina={setMovPorPagina}
          docFiltroTipo={docFiltroTipo}
          setDocFiltroTipo={setDocFiltroTipo}
          docContactoPagina={docContactoPagina}
          setDocContactoPagina={setDocContactoPagina}
          docContactoPorPagina={docContactoPorPagina}
          setDocContactoPorPagina={setDocContactoPorPagina}      />
      )}

      {/* ── NUEVO ── */}
      {tab === 'nuevo' && (
        <NuevoMovimientoTab onGuardado={() => { setSinMovimientosMes(false); setTab('movimientos'); qc.invalidateQueries({ queryKey: movimientoKeys.all }); qc.invalidateQueries({ queryKey: dashboardKeys.all }); }} />
      )}

      {/* ── Modal contacto (cliente / equipo) ── */}
      {modalContacto && <ModalContacto
        tipo={modalContacto.tipo}
        datos={modalContacto.datos}
        onGuardado={() => setModalContacto(null)}
        onCerrar={() => setModalContacto(null)}
      />}

      {/* ── Modal Nuevos Contactos detectados al guardar facturas ── */}
      <ModalNuevosContactos
          modalNuevosContactos={modalNuevosContactos}
          setModalNuevosContactos={setModalNuevosContactos}
          confirmandoContactos={confirmandoContactos}
          setConfirmandoContactos={setConfirmandoContactos}
          contactosTodos={contactosTodos}
          qc={qc}      />

      {/* ── Confirm dialog ── */}
      {confirmDialog && (
        <div onClick={() => setConfirmDialog(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 14, padding: '24px 28px', width: '100%', maxWidth: 380, textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>{confirmDialog.texto}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDialog(null)}
                style={{ padding: '8px 22px', borderRadius: 8, border: '1px solid #3f3f46', background: 'none', color: '#a1a1aa', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button onClick={() => { confirmDialog.onOk(); setConfirmDialog(null); }}
                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split view desde vista Conflictos de Documentos */}
      {/* Split view compartido: movimiento (izq) + factura (der) */}
      <SplitViewModal
        data={docSplitView}
        onClose={() => setDocSplitView(null)}
        onEditarMovimiento={m => { abrirDetalle(m.id); setDocSplitView(null); }}
        onEditarFactura={fac => { setFacturaViewerId(fac.id); setDocSplitView(null); }}
        zIndex={9200}
      />

      {/* Viewer modal documentos/facturas */}
      <ModalDocumentoViewer
          facturaViewerId={facturaViewerId}
          facturaViewerData={facturaViewerData}
          facturaViewerLoading={facturaViewerLoading}
          facturaViewerError={facturaViewerError}
          setFacturaViewerId={setFacturaViewerId}
          setFacturaViewerAutoEdit={setFacturaViewerAutoEdit}
          viewerEditando={viewerEditando}
          setViewerEditando={setViewerEditando}
          viewerDraft={viewerDraft}
          setViewerDraft={setViewerDraft}
          viewerVincOpen={viewerVincOpen}
          setViewerVincOpen={setViewerVincOpen}
          contactosTodos={contactosTodos}
          movimientosParaVincular={movimientosParaVincular}
          loadingMovsVincular={loadingMovsVincular}
          toggleMovimientoEnFactura={toggleMovimientoEnFactura}
          contactFiscalUpdates={contactFiscalUpdates}
          guardarCeldaDoc={guardarCeldaDoc}
          qc={qc}      />

    </div>
  );
}
