import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMovimiento, movimientoKeys,
  useFacturas, useFactura, facturaKeys, dashboardKeys,
  useFiscal, useGuardarFacturas, useEliminarFactura, useBulkDeleteFacturas,
  useContactosTodos, contactoKeys,
} from '@/features/finanzas';
import { BACKEND_URL } from '@/lib/config';
import { fmt, getToken } from '../utils';
import { MetricCard } from './MetricCard';
import { detectarConflictosFiscales } from './fiscal/detectarConflictos';
import { TrimestresFiscal } from './fiscal/TrimestresFiscal';
import { ModalConflictosFiscales } from './fiscal/ModalConflictosFiscales';
import { ModalDetalleModelo } from './fiscal/ModalDetalleModelo';

export function TabFiscal({ onAbrirMovimiento, facturaViewerData, setFacturaViewerId, setFacturaViewerAutoEdit, onFacturasEliminadas, findBestMatch, toggleMovimientoEnFactura, setModalNuevosContactos }) {
  const qc = useQueryClient();

  // ─── UI-STATE ──────────────────────────────────────────────────────────────
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [comparar, setComparar] = useState(false);
  const [anioComp, setAnioComp] = useState(null);
  // Facturas
  const [trimestreAbierto, setTrimestreAbierto] = useState(null); // 0-3
  const [pendientes, setPendientes] = useState([]); // facturas extraídas pendientes de guardar
  const [extrayendo, setExtrayendo] = useState(false); // solo para deshabilitar el botón que está en uso
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef(null);
  const [tipoActivo, setTipoActivo] = useState(null); // 'ingreso' | 'gasto'
  const [dragOver, setDragOver] = useState(null); // 'ingreso' | 'gasto' | null
  const [selFacturas, setSelFacturas] = useState(new Set()); // ids seleccionados para bulk delete

  // ─── Fase 9: server-state fiscal en TanStack Query ────────────────────────
  const _fiscalQuery     = useFiscal({ anio });
  const _fiscalCompQuery = useFiscal(
    { anio: anioComp ?? anio },
    { enabled: comparar && !!anioComp }
  );
  const datos      = _fiscalQuery.data ?? null;
  const loading    = _fiscalQuery.isLoading;
  const err        = _fiscalQuery.isError ? (_fiscalQuery.error?.message ?? 'Error al cargar fiscal') : null;
  const datosComp  = comparar && anioComp ? (_fiscalCompQuery.data ?? null) : null;
  const loadingComp = comparar && !!anioComp && _fiscalCompQuery.isLoading;

  // Facturas del trimestre activo — enabled solo cuando hay trimestre abierto
  const _facturasTriQuery = useFacturas(
    trimestreAbierto !== null ? { anio, trimestre: trimestreAbierto + 1 } : {},
    { enabled: trimestreAbierto !== null }
  );
  const facturasActivasTrimestre = _facturasTriQuery.data ?? [];

  // ─── Mutations ────────────────────────────────────────────────────────────
  const _guardarFacMut    = useGuardarFacturas();
  const _eliminarFacMut   = useEliminarFactura();
  const _bulkDeleteFacMut = useBulkDeleteFacturas();
  // facturaViewerData/setFacturaViewerId/setFacturaViewerAutoEdit son props de Finanzas (Fase 6)
  const [facturaFiltro, setFacturaFiltro] = useState('todos'); // 'todos' | 'ingreso' | 'gasto'
  const [facturaOrden, setFacturaOrden] = useState('fecha_desc'); // 'fecha_desc' | 'fecha_asc' | 'importe_desc' | 'importe_asc'
  const [subirAbierto, setSubirAbierto] = useState(false); // mostrar zonas de drop
  // Detectar errores
  const [erroresModal, setErroresModal] = useState(false);
  const [erroresData, setErroresData] = useState([]);
  const [detectando, setDetectando] = useState(false);
  const [errMovDetailId, setErrMovDetailId] = useState(null);
  const errMovQuery  = useMovimiento(errMovDetailId);
  const errMovDetail = errMovQuery.data ?? null;
  const [errMovEditar, setErrMovEditar] = useState(null);
  const [errFiltro, setErrFiltro] = useState('todos'); // 'todos' | 'error' | 'warning' | 'info'
  const [errSplitView, setErrSplitView] = useState(null); // { movimiento, factura } | null
  const [modDetalle, setModDetalle] = useState(null); // { num, titulo, desc, valor, valorLabel, secciones } | null

  // Abre un movimiento desde el contexto de errores con datos completos + actualiza URL
  function abrirMovEnErrores(mov) {
    const params = new URLSearchParams(window.location.search);
    params.set('mov', mov.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    // useMovimiento(errMovDetailId) se activará automáticamente y poblará errMovDetail
    setErrMovDetailId(mov.id);
  }

  // Fase 9: cargar/cargarComp eliminados — server-state gestionado por useFiscal arriba.

  // Realtime: finanzas_facturas_movimientos y finanzas_facturas NO están en la publication
  // (solo finanzas_movimientos está activa). El canal es no-op hasta que se añadan a la publication.
  // Fase 10A: fiscal_vinculos eliminado — escuchaba finanzas_facturas_movimientos y
  // finanzas_facturas, ambas fuera de publication. Era 100% no-op.
  // erroresData permanece análisis efímero one-shot: el usuario re-ejecuta Detectar errores.

  // Sync factura updates (desde viewer edit via useFactura) a erroresData y TQ cache
  useEffect(() => {
    if (!facturaViewerData?.id) return;
    const fv = facturaViewerData;
    setErroresData(prev => prev.map(c =>
      c.factura?.id === fv.id ? { ...c, factura: { ...c.factura, ...fv } } : c
    ));
    // Invalidar todas las listas de facturas para que TQ refetch con los datos del viewer
    qc.invalidateQueries({ queryKey: facturaKeys.lists() });
  }, [facturaViewerData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fase 9: cargarFacturasTrimestre eliminado — TQ auto-fetches cuando trimestreAbierto cambia.
  function toggleTrimestre(i) {
    if (trimestreAbierto === i) { setTrimestreAbierto(null); setPendientes([]); setSelFacturas(new Set()); setSubirAbierto(false); }
    else { setTrimestreAbierto(i); setPendientes([]); setSelFacturas(new Set()); setSubirAbierto(false); }
  }

  function eliminarFacturasBulk() {
    if (!selFacturas.size) return;
    const ids = [...selFacturas];
    _bulkDeleteFacMut.mutate(ids, {
      onSuccess: ({ deletedIds }) => {
        if (!deletedIds.length) return;
        const deletedSet = new Set(deletedIds);
        setSelFacturas(prev => { const s = new Set(prev); deletedSet.forEach(id => s.delete(id)); return s; });
        onFacturasEliminadas?.(deletedIds);
      },
      onError: (e) => { alert('Error: ' + e.message); },
    });
  }

  async function handleFiles(files, tipo) {
    if (!files.length) return;
    const fileArr = Array.from(files);
    const token = await getToken();

    // Añadir placeholders "procesando" inmediatamente para cada archivo
    const placeholders = fileArr.map(f => ({ _id: Math.random().toString(36).slice(2), archivo_nombre: f.name, tipo, anio, trimestre: trimestreAbierto + 1, _procesando: true }));
    setPendientes(prev => [...prev, ...placeholders]);
    setExtrayendo(true);

    // Procesar cada archivo en paralelo
    await Promise.all(fileArr.map(async (file, idx) => {
      const placeholderId = placeholders[idx]._id;
      try {
        const fd = new FormData();
        fd.append('files', file);
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/extraer`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `Error ${r.status}`); }
        const data = await r.json();
        const extraida = data.facturas?.[0] || {};
        setPendientes(prev => prev.map(p => p._id === placeholderId ? { ...extraida, _id: placeholderId, tipo, anio, trimestre: trimestreAbierto + 1, _procesando: false } : p));
      } catch (e) {
        setPendientes(prev => prev.map(p => p._id === placeholderId ? { ...p, _procesando: false, _error: e.message } : p));
      }
    }));

    setExtrayendo(false);
  }

  function guardarPendientes() {
    const listas = pendientes.filter(p => !p._procesando && !p._error); // incluye _warning (datos parciales)
    if (!listas.length) return;
    setGuardando(true);
    _guardarFacMut.mutate(listas, {
      onSuccess: async (data) => {
        const idsGuardados = new Set(listas.map(p => p._id));
        setPendientes(prev => prev.filter(p => !idsGuardados.has(p._id)));
        // facturaKeys.all, movimientoKeys.all, dashboardKeys.all, contactoKeys.all
        // ya invalidados por useGuardarFacturas.onSuccess
        if (data.nuevos_pendientes?.length) {
          // contactoKeys.all ya invalidado por useGuardarFacturas.onSuccess → useContactosTodos() se refresca solo
          setModalNuevosContactos(data.nuevos_pendientes.map(p => ({
            ...p, _nombre: '', _nombre_empresa: p.nombre_entidad || '', _asignarA: null, _ignorar: false,
            _nif_cif: p.nif_cif || '', _direccion: p.direccion || '', _email: p.email || '', _roles: ['proveedor'],
          })));
        }
      },
      onError: (e) => { alert('Error guardando: ' + e.message); },
      onSettled: () => { setGuardando(false); },
    });
  }

  function eliminarFactura(id) {
    _eliminarFacMut.mutate(id, {
      onSuccess: () => onFacturasEliminadas?.([id]),
      onError: (e) => { alert('Error: ' + e.message); },
    });
  }

  async function detectarErrores() {
    // Fase 9: facturasCache viene de la query TQ activa del trimestre abierto
    const facturasCache = facturasActivasTrimestre;
    if (!facturasCache.length) { alert('No hay facturas guardadas en este trimestre'); return; }
    setDetectando(true);
    try {
      const token = await getToken();
      // Refetch facturas frescas desde DB (con movimiento_ids actualizados de la junction table)
      const fRes = await fetch(`${BACKEND_URL}/admin/finanzas/facturas?anio=${anio}&trimestre=${trimestreAbierto + 1}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const facturasGuardadas = fRes.ok ? (await fRes.json()) : facturasCache;
      // Fase 9: setFacturasPorTrimestre eliminado — TQ invalida y refetch automáticamente
      if (fRes.ok) qc.invalidateQueries({ queryKey: facturaKeys.list({ anio, trimestre: trimestreAbierto + 1 }) });

      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos-con-factura?anio=${anio}&trimestre=${trimestreAbierto + 1}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const movs = await r.json();
      if (!r.ok) throw new Error(movs.error || `Error ${r.status}`);

      // Contactos disponibles para el matching
      let ctodosMatch = [];
      try {
        const rc = await fetch(`${BACKEND_URL}/admin/finanzas/contactos/todos`, { headers: { Authorization: `Bearer ${token}` } });
        if (rc.ok) ctodosMatch = await rc.json();
      } catch (_) {}

      // Algoritmo de matching/conciliación — extraído a fiscal/detectarConflictos.js (Fase 16)
      const conflictos = detectarConflictosFiscales({ facturasGuardadas, movs, ctodosMatch });


      setErroresData(conflictos);
      setErroresModal(true);
    } catch (e) { alert('Error: ' + e.message); }
    setDetectando(false);
  }

  const anios = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  if (loading) return <p style={{ color: '#52525b' }}>Cargando…</p>;
  if (err)    return <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {err}</p>;
  if (!datos)  return null;

  const { trimestres, anual } = datos;
  const ca = datosComp?.anual;


  return (
    <div>
      {/* Selector año */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {anios.map(a => (
          <button key={a} onClick={() => { setAnio(a); setTrimestreAbierto(null); setPendientes([]); }}
            style={{ background: anio === a ? '#0067FD' : '#27272a', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
            {a}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#a1a1aa', fontSize: 12, marginLeft: 8 }}>
          <input type="checkbox" checked={comparar} onChange={e => { setComparar(e.target.checked); if (!e.target.checked) { setAnioComp(null); } }} style={{ accentColor: '#0067FD', cursor: 'pointer' }} />
          Comparar con
        </label>
        {comparar && anios.filter(a => a !== anio).map(a => (
          <button key={a} onClick={() => setAnioComp(a)}
            style={{ background: anioComp === a ? '#27272a' : 'transparent', color: anioComp === a ? 'white' : '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
            {a}
          </button>
        ))}
        {loadingComp && <span style={{ color: '#52525b', fontSize: 12 }}>cargando…</span>}
      </div>

      {/* Resumen anual */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Resumen anual {anio}{datosComp ? ` vs ${anioComp}` : ''}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
        <MetricCard label="Facturación"     value={fmt(anual.facturacion)}    color="#22c55e" compValue={ca ? ca.facturacion : null} />
        <MetricCard label="Gastos totales"  value={fmt(anual.totalGastos)}    color="#f87171" compValue={ca ? ca.totalGastos : null} />
        {(() => { const b = anual.facturacion - anual.totalGastos; const bc = ca ? ca.facturacion - ca.totalGastos : null; return <MetricCard label="Beneficio" value={fmt(b)} color={b >= 0 ? '#10b981' : '#f87171'} compValue={bc} />; })()}
        <MetricCard label="IVA repercutido" value={fmt(anual.ivaRepercutido)} color="#f59e0b" compValue={ca ? ca.ivaRepercutido : null} />
        <MetricCard label="IVA soportado"   value={fmt(anual.ivaSoportado)}   color="#f59e0b" compValue={ca ? ca.ivaSoportado : null} />
        <MetricCard label="IVA a pagar"     value={fmt(anual.ivaAPagar)}      color={anual.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} compValue={ca ? ca.ivaAPagar : null} />
        <MetricCard label="IRPF retenido"   value={fmt(anual.irpfRetenido)}   color="#8b5cf6" compValue={ca ? ca.irpfRetenido : null} />
      </div>

      <TrimestresFiscal
        trimestres={trimestres} datosComp={datosComp} anioComp={anioComp}
        trimestreAbierto={trimestreAbierto} toggleTrimestre={toggleTrimestre}
        facturasActivasTrimestre={facturasActivasTrimestre} detectando={detectando} detectarErrores={detectarErrores}
        pendientes={pendientes} setPendientes={setPendientes}
        selFacturas={selFacturas} setSelFacturas={setSelFacturas}
        facturaFiltro={facturaFiltro} setFacturaFiltro={setFacturaFiltro}
        facturaOrden={facturaOrden} setFacturaOrden={setFacturaOrden}
        subirAbierto={subirAbierto} setSubirAbierto={setSubirAbierto}
        tipoActivo={tipoActivo} setTipoActivo={setTipoActivo}
        dragOver={dragOver} setDragOver={setDragOver}
        extrayendo={extrayendo} guardando={guardando} fileInputRef={fileInputRef}
        handleFiles={handleFiles} guardarPendientes={guardarPendientes}
        eliminarFacturasBulk={eliminarFacturasBulk} _bulkDeleteFacMut={_bulkDeleteFacMut} eliminarFactura={eliminarFactura}
        setFacturaViewerId={setFacturaViewerId} setModDetalle={setModDetalle}
      />

      <ModalConflictosFiscales
        erroresModal={erroresModal} setErroresModal={setErroresModal}
        erroresData={erroresData} setErroresData={setErroresData}
        errFiltro={errFiltro} setErrFiltro={setErrFiltro}
        errMovDetailId={errMovDetailId} setErrMovDetailId={setErrMovDetailId}
        errMovDetail={errMovDetail} errMovEditar={errMovEditar} setErrMovEditar={setErrMovEditar}
        errSplitView={errSplitView} setErrSplitView={setErrSplitView}
        abrirMovEnErrores={abrirMovEnErrores} findBestMatch={findBestMatch}
        toggleMovimientoEnFactura={toggleMovimientoEnFactura}
        setFacturaViewerId={setFacturaViewerId} setFacturaViewerAutoEdit={setFacturaViewerAutoEdit}
      />

      <ModalDetalleModelo modDetalle={modDetalle} setModDetalle={setModDetalle} setFacturaViewerId={setFacturaViewerId} />
    </div>
  );
}
