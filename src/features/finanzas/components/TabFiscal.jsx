import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMovimiento, movimientoKeys,
  useFacturas, useFactura, facturaKeys, dashboardKeys,
  useFiscal, useGuardarFacturas, useEliminarFactura, useBulkDeleteFacturas,
  useContactosTodos, contactoKeys,
} from '@/features/finanzas';
import { BACKEND_URL } from '@/lib/config';
import { S } from '../constants';
import { fmt, getToken } from '../utils';
import { ModalEditar } from './ModalEditar';
import { ModalMovimiento } from './ModalMovimiento';
import { SplitViewModal } from './SplitViewModal';
import { MetricCard } from './MetricCard';
import { FiscalMetric } from './FiscalMetric';

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

      const conflictos = [];
      const movsUsados = new Set();
      const normTipo = t => (t || '').toLowerCase().includes('ingreso') ? 'ingreso' : 'gasto';
      const mesNom = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

      // Tokeniza un texto: minúsculas, sin acentos, sin puntuación, palabras de ≥3 chars
      const tokens = s => (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/).filter(w => w.length >= 3);

      // Contactos disponibles para el matching
      let ctodosMatch = [];
      try {
        const rc = await fetch(`${BACKEND_URL}/admin/finanzas/contactos/todos`, { headers: { Authorization: `Bearer ${token}` } });
        if (rc.ok) ctodosMatch = await rc.json();
      } catch (_) {}

      // Nombres canónicos de una factura: siempre del contacto vinculado (nombre + alias).
      // Si no hay contacto vinculado, devuelve [] — se trata como error de datos.
      const facNombres = fac => {
        const contactoId = fac.tipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        const contacto = contactoId ? ctodosMatch.find(c => c.id === contactoId) : null;
        if (!contacto) return [];
        const nombres = [];
        if (contacto.nombre) nombres.push(contacto.nombre);
        if (contacto.nombre_empresa) nombres.push(contacto.nombre_empresa);
        if (Array.isArray(contacto.alias)) nombres.push(...contacto.alias.filter(Boolean));
        return nombres;
      };

      // Penalización: usa TODOS los nombres candidatos de la factura, devuelve la menor penalización
      const nombrePenaltyFac = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return 0;
        const tM = tokens(movNombre);
        return Math.min(...nombres.map(n => {
          const tF = tokens(n);
          if (!tF.length) return 0;
          const matches = tF.filter(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
          return (1 - matches.length / tF.length) * 8;
        }));
      };

      // Descarte duro: solo si TODOS los nombres candidatos de la factura son incompatibles con el movimiento
      // (ambos lados ≥2 tokens y sin tokens en común)
      const nombreIncompatible = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return false;
        const tM = tokens(movNombre);
        if (!tM.length) return false;
        // Compatible si ALGÚN nombre candidato tiene tokens en común con el movimiento
        return !nombres.some(n => {
          const tF = tokens(n);
          if (tF.length < 2 || tM.length < 2) return true; // no suficiente contexto → no descartar
          return tF.some(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
        });
      };

      // Error: factura sin ningún movimiento vinculado en la junction table
      for (const fac of facturasGuardadas) {
        if (!fac.movimiento_ids || fac.movimiento_ids.length === 0) {
          const contactoReqId = fac.tipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
          if (contactoReqId) { // Solo si ya tiene contacto (sin_contacto ya lo cubre)
            conflictos.push({
              tipo: 'sin_movimiento_vinculado',
              factura: fac,
              severidad: 'error',
              desc: `La factura de ${fmt(Math.abs(fac.importe||0))} no tiene ningún movimiento vinculado. Vincúlala desde la pestaña Documentos.`
            });
          }
        }
      }

      // Para cada factura subida, buscar el movimiento DB más parecido
      // NOTA: fac.importe es la BASE (sin IVA). El movimiento tiene base_imponible y cantidad (total con IVA).
      for (const fac of facturasGuardadas) {
        const facBase  = Math.abs(fac.importe || 0);
        const facIva   = Math.abs(fac.impuesto || 0);
        const facTotal = facBase + facIva;
        const facTipo  = fac.tipo;

        // Error: factura sin contacto vinculado (siempre debe tener proveedor o cliente)
        const contactoReqId = facTipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        if (!contactoReqId) {
          conflictos.push({ tipo: 'sin_contacto', factura: fac, severidad: 'error',
            desc: `Factura de ${fmt(facBase)} sin ${facTipo === 'gasto' ? 'proveedor' : 'cliente'} vinculado. Asigna el contacto en la pestaña Documentos.` });
          continue;
        }

        // Distancia de importes: mínimo entre 4 combinaciones base/total
        const importeDiff = m => Math.min(
          Math.abs(Math.abs(m.base_imponible || 0) - facBase),
          Math.abs(Math.abs(m.cantidad || 0) - facTotal),
          Math.abs(Math.abs(m.base_imponible || 0) - facTotal),
          Math.abs(Math.abs(m.cantidad || 0) - facBase)
        );

        // Penalización por distancia de fecha: 0.1 € por día de diferencia entre
        // la fecha de la factura (doc) y la fecha del movimiento.
        // Permite desempatar cuando dos movimientos tienen el mismo importe (ej: dos suscripciones SaaS).
        const fechaPenalty = m => {
          if (!fac.fecha_factura || !m.fecha) return 0;
          const dias = Math.abs(new Date(fac.fecha_factura) - new Date(m.fecha)) / 86400000;
          return dias * 0.1;
        };

        // 1º: movimientos con importe_factura explícito
        let candidatos = movs
          .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.importe_factura != null && !nombreIncompatible(fac, m.nombre))
          .map(m => {
            const diff = Math.min(
              Math.abs(Math.abs(m.importe_factura) - facBase),
              Math.abs(Math.abs(m.importe_factura) - facTotal)
            );
            return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
          })
          .filter(c => c.diff <= 1)
          .sort((a, b) => a.score - b.score);

        // 2º: movimientos con fecha_factura pero sin importe_factura — comparar por base/total
        // Umbral 2.5€ para absorber diferencias de conversión de divisa (ej: USD→EUR)
        if (!candidatos.length) {
          candidatos = movs
            .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.fecha_factura != null && m.importe_factura == null && !nombreIncompatible(fac, m.nombre))
            .map(m => {
              const diff = importeDiff(m);
              return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
            })
            .filter(c => c.diff <= 2.5)
            .sort((a, b) => a.score - b.score);
        }

        if (!candidatos.length) {
          conflictos.push({ tipo: 'sin_movimiento', factura: fac, severidad: 'warning',
            desc: `Factura de ${fmt(facBase)} sin movimiento en DB que tenga datos de factura asociados. Puede que el movimiento exista pero le falte rellenar "importe factura" o "fecha factura".` });
          continue;
        }

        const { m } = candidatos[0];
        movsUsados.add(m.id);

        // Movimiento fuera del trimestre actual (cross-trimestre detectado via buffer ±35 días)
        if (m._fuera_trimestre) {
          const [mY, mM] = m.fecha.split('-').map(Number);
          conflictos.push({ tipo: 'cross_trimestre', movimiento: m, factura: fac, severidad: 'error',
            desc: `El movimiento está en ${mesNom[mM-1]}-${mY}, fuera de este trimestre — la factura fue emitida en este período pero el cobro/pago cayó en otro trimestre` });
        }

        // Conflicto: desfase de fecha entre fecha_factura del doc y fecha del movimiento
        if (!m._fuera_trimestre && fac.fecha_factura && m.fecha) {
          const [fY, fM] = fac.fecha_factura.split('-').map(Number);
          const [mY, mM] = m.fecha.split('-').map(Number);
          if (fY !== mY || fM !== mM) {
            conflictos.push({ tipo: 'desfase_fecha', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Factura emitida en ${mesNom[fM-1]}-${fY} pero el movimiento está registrado en ${mesNom[mM-1]}-${mY}` });
          }
        }

        // Conflicto: desfase entre fecha_factura guardada en DB y fecha del documento subido
        // Para gastos: es normal que el doc tenga fecha posterior al movimiento (ciclo de facturación).
        // Solo alertar si la diferencia es > 5 días O si el doc es anterior a la DB.
        if (fac.fecha_factura && m.fecha_factura && fac.fecha_factura !== m.fecha_factura) {
          const docDate = new Date(fac.fecha_factura);
          const dbDate  = new Date(m.fecha_factura);
          const diffDias = (docDate - dbDate) / 86400000; // positivo = doc más reciente
          const esGasto = facTipo === 'gasto';
          const esCasoNormal = esGasto && diffDias > 0 && diffDias <= 5; // doc posterior ≤5 días en compra → OK
          if (!esCasoNormal) {
            conflictos.push({ tipo: 'fecha_factura_distinta', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Fecha en el documento: ${fac.fecha_factura} vs fecha de factura en DB: ${m.fecha_factura}` });
          }
        }

        // Conflicto: IVA
        const movIva = Math.abs(m.iva_a_pagar || 0);
        if (facIva > 0 && movIva === 0) {
          conflictos.push({ tipo: 'iva_faltante_db', movimiento: m, factura: fac, severidad: 'error',
            desc: `La factura refleja ${fmt(facIva)} de IVA pero el movimiento no tiene IVA registrado` });
        } else if (facIva === 0 && movIva > 0) {
          conflictos.push({ tipo: 'iva_en_db_sin_factura', movimiento: m, factura: fac, severidad: 'warning',
            desc: `El movimiento tiene ${fmt(movIva)} de IVA en DB pero la factura subida no muestra IVA` });
        } else if (facIva > 0 && movIva > 0 && Math.abs(facIva - movIva) > 1) {
          conflictos.push({ tipo: 'iva_diferente', movimiento: m, factura: fac, severidad: 'error',
            desc: `IVA en factura: ${fmt(facIva)} vs IVA en DB: ${fmt(movIva)} (diferencia ${fmt(Math.abs(facIva - movIva))})` });
        }

        // Conflicto: total pagado ≠ total factura (base + IVA)
        const movTotal = Math.abs(m.cantidad || 0);
        if (facTotal > 0 && Math.abs(movTotal - facTotal) > 1) {
          conflictos.push({ tipo: 'importe_distinto', movimiento: m, factura: fac, severidad: 'warning',
            desc: `Total cobrado/pagado: ${fmt(movTotal)} vs total factura (base+IVA): ${fmt(facTotal)}` });
        }
      }

      // Movimientos con datos de factura en DB que no matchearon con ninguna factura subida
      for (const m of movs) {
        if (!movsUsados.has(m.id) && (m.importe_factura != null || m.fecha_factura != null)) {
          conflictos.push({ tipo: 'sin_factura_subida', movimiento: m, severidad: 'info',
            desc: `Tiene ${m.importe_factura != null ? `importe_factura: ${fmt(Math.abs(m.importe_factura))}` : ''}${m.fecha_factura ? ` fecha: ${m.fecha_factura}` : ''} en DB pero ninguna factura subida coincide` });
        }
      }

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

  const FacturaRow = ({ f, onDelete, selectable }) => {
    const [hovered, setHovered] = useState(false);
    if (f._procesando) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#52525b', fontSize:11 }}>📄</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f59e0b', fontSize:11, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:'2px solid #f59e0b', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
          Extrayendo…
        </span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    if (f._error) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#f87171', fontSize:11 }}>⚠️</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f87171', fontSize:11, flexShrink:0 }}>{f._error}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    const checked = selectable && selFacturas.has(f.id);
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderBottom:'1px solid #27272a', fontSize:12, flexWrap:'wrap', background: checked ? '#1a1a2e' : 'transparent' }}>
        {selectable && (
          <input type="checkbox" checked={checked} onChange={e => {
            setSelFacturas(prev => { const s = new Set(prev); e.target.checked ? s.add(f.id) : s.delete(f.id); return s; });
          }} style={{ accentColor:'#0067FD', cursor:'pointer', flexShrink:0, opacity: hovered || checked ? 1 : 0, transition:'opacity 0.15s' }} />
        )}
        <span style={{ color: f._warning ? '#f59e0b' : '#52525b', fontSize:11, minWidth:16 }} title={f._warning || undefined}>{f._warning ? '⚠️' : '📄'}</span>
        {f.archivo_url
          ? <button onClick={() => setFacturaViewerId(f.id)} style={{ flex:1, background:'none', border:'none', padding:0, color: f._warning ? '#fbbf24' : '#60a5fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100, textAlign:'left', cursor:'pointer', fontSize:12 }} title={f._warning || 'Ver documento'}>{f.archivo_nombre || '—'}</button>
          : <span style={{ flex:1, color: f._warning ? '#fbbf24' : '#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100 }} title={f._warning || undefined}>{f.archivo_nombre || '—'}</span>
        }
        <span style={{ background: f.tipo==='ingreso' ? '#052e16' : '#1a0a0a', color: f.tipo==='ingreso' ? '#22c55e' : '#f87171', border: `1px solid ${f.tipo==='ingreso'?'#166534':'#7f1d1d'}`, borderRadius:4, padding:'1px 7px', fontSize:11, flexShrink:0 }}>
          {f.tipo === 'ingreso' ? 'Venta' : 'Compra'}
        </span>
        <span style={{ color:'#71717a', minWidth:88, flexShrink:0 }}>{f.fecha_factura || '—'}</span>
        <span style={{ color:'#d4d4d8', minWidth:60, flexShrink:0 }}>Nº {f.numero_factura || '—'}</span>
        <span style={{ color:'#71717a', minWidth:90, flexShrink:0 }}>{f.nif_cif || '—'}</span>
        <span style={{ color:'white', fontWeight:600, minWidth:75, textAlign:'right', flexShrink:0 }}>{f.importe != null ? fmt(f.importe)+' €' : '—'}</span>
        <span style={{ color:'#f59e0b', minWidth:65, textAlign:'right', flexShrink:0 }}>IVA {f.impuesto != null ? fmt(f.impuesto)+' €' : '—'}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
        {!onDelete && f.id && <button onClick={() => eliminarFactura(f.id)} style={{ background:'none', border:'none', color:'#3f3f46', cursor:'pointer', fontSize:12, padding:'0 2px', flexShrink:0 }}>🗑</button>}
      </div>
    );
  };

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

      {/* Por trimestre */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por trimestre</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {trimestres.map((t, i) => {
          const tc = datosComp?.trimestres?.[i];
          const abierto = trimestreAbierto === i;
          // Fase 9: facturas del trimestre activo desde TQ; el resto están vacías (no cargadas)
          const facturasGuardadas = abierto ? facturasActivasTrimestre : [];
          return (
            <div key={i} style={S.card}>
              {/* Cabecera trimestre — clickable */}
              <div onClick={() => toggleTrimestre(i)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom: abierto ? 12 : 0 }}>
                <span style={{ color:'#52525b', fontSize:11, transition:'transform 0.2s', display:'inline-block', transform: abierto ? 'rotate(90deg)' : 'none' }}>▶</span>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0, flex:1 }}>
                  {t.label}{tc ? <span style={{ color: '#52525b', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>vs {anioComp}</span> : null}
                </p>
              </div>

              {/* Métricas fiscales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: abierto ? 16 : 0 }}>
                <FiscalMetric label="Facturación"         value={t.facturacion}                    color="#22c55e" comp={tc ? tc.facturacion : null} />
                <FiscalMetric label="Gastos"              value={t.totalGastos}                    color="#f87171" comp={tc ? tc.totalGastos : null} />
                <FiscalMetric label="Beneficio"           value={t.facturacion - t.totalGastos}    color={(t.facturacion - t.totalGastos) >= 0 ? '#10b981' : '#f87171'} comp={tc ? tc.facturacion - tc.totalGastos : null} />
                <FiscalMetric label="IVA repercutido"     value={t.ivaRepercutido}                 color="#f59e0b" comp={tc ? tc.ivaRepercutido : null} />
                <FiscalMetric label="IVA soportado"       value={t.ivaSoportado}                   color="#f59e0b" comp={tc ? tc.ivaSoportado : null} />
                <FiscalMetric label="IVA a pagar (303)"   value={t.ivaAPagar}                      color={t.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} comp={tc ? tc.ivaAPagar : null} />
                <FiscalMetric label="IRPF retenido (130)" value={t.irpfRetenido}                   color="#8b5cf6" comp={tc ? tc.irpfRetenido : null} />
              </div>

              {/* IRPF por cliente */}
              {Object.keys(t.irpfPorCliente).length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #27272a' }}>
                  <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>IRPF retenido por cliente</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(t.irpfPorCliente).sort(([,a],[,b]) => b - a).map(([nombre, irpf]) => (
                      <div key={nombre} style={{ background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, padding: '6px 10px' }}>
                        <p style={{ color: '#a1a1aa', fontSize: 11, margin: 0 }}>{nombre}</p>
                        <p style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(irpf)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección facturas (solo si abierto) */}
              {abierto && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #27272a' }}>
                  {/* Comparativa DB vs Con Factura DB vs Facturas subidas */}
                  {facturasGuardadas.length > 0 && (() => {
                    // Facturas subidas (año actual)
                    const fIng  = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.importe || 0), 0);
                    const fGas  = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.importe || 0), 0);
                    const fIvaR = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.impuesto || 0), 0);
                    const fIvaS = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.impuesto || 0), 0);
                    // DB total (año actual)
                    const dbIng = t.facturacion; const dbGas = t.totalGastos;
                    const dbIvaR = t.ivaRepercutido; const dbIvaS = t.ivaSoportado;
                    // DB con factura (año actual)
                    const cf = t.conFactura || {};
                    const cfIng = cf.facturacion || 0; const cfGas = cf.totalGastos || 0;
                    const cfIvaR = cf.ivaRepercutido || 0; const cfIvaS = cf.ivaSoportado || 0;
                    // Comparativa (año anterior — solo DB)
                    const cfc = tc?.conFactura || {};

                    const dc = v => v === 0 ? '#52525b' : v > 0 ? '#22c55e' : '#f87171';
                    const dl = v => v === 0 ? '±0' : (v > 0 ? '+' : '') + fmt(v);
                    const Col = ({ v, color, comp }) => (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
                        <span style={{ color: color || '#d4d4d8', fontWeight:600 }}>{fmt(v)}</span>
                        {comp != null && <span style={{ color:'#3f3f46', fontSize:10 }}>ant. {fmt(comp)}</span>}
                      </div>
                    );
                    const DCol = ({v}) => <span style={{ color: dc(v), fontWeight:700, fontSize:11 }}>{dl(v)}</span>;
                    const cols = ['Ingresos','IVA rep.','Gastos','IVA sop.'];
                    const rows = [
                      { label:'Total movimientos', vals:[dbIng, dbIvaR, dbGas, dbIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [tc.facturacion, tc.ivaRepercutido, tc.totalGastos, tc.ivaSoportado] : null },
                      { label:'Con factura (DB)',  vals:[cfIng, cfIvaR, cfGas, cfIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [cfc.facturacion||0, cfc.ivaRepercutido||0, cfc.totalGastos||0, cfc.ivaSoportado||0] : null },
                      { label:'Facturas subidas',  vals:[fIng, fIvaR, fGas, fIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'], comps: null },
                      { label:'Diferencia (sub−DB fact)', diff: true, vals:[fIng-cfIng, fIvaR-cfIvaR, fGas-cfGas, fIvaS-cfIvaS], comps: null },
                    ];
                    return (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', marginBottom:14, overflowX:'auto' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                          <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
                            Conciliación facturas vs movimientos{tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp}</span> : null}
                          </p>
                          <button onClick={detectarErrores} disabled={detectando}
                            style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'2px 10px', fontSize:10, cursor: detectando ? 'not-allowed' : 'pointer', fontWeight:600, opacity: detectando ? 0.7 : 1, flexShrink:0 }}>
                            {detectando ? 'Analizando…' : '⚠ Detectar errores'}
                          </button>
                        </div>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                          <thead>
                            <tr>
                              <th style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'left', paddingRight:16, paddingBottom:6, whiteSpace:'nowrap' }}></th>
                              {cols.map(c => <th key={c} style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'right', paddingRight:12, paddingBottom:6, whiteSpace:'nowrap' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(({ label, vals, colors, diff, comps }) => (
                              <tr key={label} style={{ borderTop:'1px solid #1f1f1f' }}>
                                <td style={{ color: diff ? '#52525b' : '#71717a', fontSize:11, paddingRight:16, paddingTop:5, paddingBottom:5, whiteSpace:'nowrap', verticalAlign:'top' }}>{label}</td>
                                {vals.map((v, vi) => (
                                  <td key={vi} style={{ textAlign:'right', paddingRight:12, paddingTop:5, paddingBottom:5, verticalAlign:'top' }}>
                                    {diff ? <DCol v={v} /> : <Col v={v} color={colors[vi]} comp={comps?.[vi]} />}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* Modelos de Hacienda (calculados desde facturas subidas) */}
                  {facturasGuardadas.length > 0 && (() => {
                    const ing = facturasGuardadas.filter(f => f.tipo === 'ingreso');
                    const gas = facturasGuardadas.filter(f => f.tipo === 'gasto');
                    // Mod.303
                    const ivaRep = ing.reduce((s, f) => s + (f.impuesto || 0), 0);
                    const ivaSop = gas.reduce((s, f) => s + Math.abs(f.impuesto || 0), 0);
                    const mod303 = ivaRep - ivaSop;
                    // Mod.111 — IRPF retenido EN gastos (lo que el usuario retiene al pagar freelancers)
                    const irpf111 = gas.filter(f => (f.irpf || 0) > 0).reduce((s, f) => s + (f.irpf || 0), 0);
                    // Mod.130 — Estimación 20% beneficio neto (estimación directa)
                    const ingBase = ing.reduce((s, f) => s + (f.importe || 0), 0);
                    const gasBase = gas.reduce((s, f) => s + Math.abs(f.importe || 0), 0);
                    const mod130 = Math.max(0, (ingBase - gasBase) * 0.20);
                    // Mod.349 — Intracomunitarias: gastos con NIF de país EU y sin IVA
                    const euRe = /^(IE|FR|DE|IT|NL|BE|PT|AT|FI|SE|DK|PL|CZ|RO|HU|SK|SI|HR|BG|EE|LV|LT|LU|MT|CY|EL|GR)/i;
                    const intracom = gas.filter(f => f.nif_cif && euRe.test(f.nif_cif) && !(f.impuesto > 0));
                    const base349 = intracom.reduce((s, f) => s + Math.abs(f.importe || 0), 0);

                    // Comparativa modelos desde DB del año anterior
                    const tcMod303 = tc ? tc.ivaAPagar : null;
                    const tcMod111 = tc ? tc.irpfRetenido : null;
                    const tcMod130 = tc ? Math.max(0, (tc.facturacion - tc.totalGastos) * 0.20) : null;

                    const ModCard = ({ num, titulo, desc, valor, valorLabel, info, comp, compLabel, secciones }) => (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', flex:'1 1 180px', minWidth:160 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <span onClick={() => secciones && setModDetalle({ num, titulo, desc, valor, valorLabel, info, secciones })}
                            style={{ background:'#1a1a1a', border:'1px solid #3f3f46', borderRadius:4, color: secciones ? '#a78bfa' : '#a1a1aa', fontSize:10, fontWeight:700, padding:'1px 6px', cursor: secciones ? 'pointer' : 'default' }}>Mod.{num}</span>
                          <span style={{ color:'#52525b', fontSize:10 }}>{titulo}</span>
                        </div>
                        <p style={{ color:'#71717a', fontSize:10, margin:'0 0 6px' }}>{desc}</p>
                        {info
                          ? <span style={{ color:'#52525b', fontSize:12, fontWeight:600 }}>Informativo</span>
                          : <>
                              <span style={{ color: valor > 0 ? '#f87171' : valor < 0 ? '#22c55e' : '#52525b', fontSize:16, fontWeight:700 }}>
                                {valor > 0 ? '' : valor < 0 ? '−' : ''}{fmt(Math.abs(valor))}
                                {valorLabel && <span style={{ color:'#52525b', fontSize:10, fontWeight:400, marginLeft:4 }}>{valorLabel}</span>}
                              </span>
                              {comp != null && (
                                <p style={{ color:'#3f3f46', fontSize:10, margin:'4px 0 0' }}>
                                  ant. {fmt(Math.abs(comp))}{compLabel ? ` ${compLabel}` : ''}
                                  {comp !== 0 && valor !== 0 && <span style={{ color: valor < comp ? '#22c55e' : '#f87171', marginLeft:4 }}>
                                    ({valor < comp ? '↓' : '↑'}{Math.round(Math.abs((valor - comp) / comp) * 100)}%)
                                  </span>}
                                </p>
                              )}
                            </>
                        }
                        {num === '349' && base349 > 0 && (
                          <p style={{ color:'#71717a', fontSize:10, margin:'4px 0 0' }}>Base: {fmt(base349)} ({intracom.length} ops.)</p>
                        )}
                      </div>
                    );

                    return (
                      <div style={{ marginBottom:14 }}>
                        <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 8px' }}>
                          Modelos de Hacienda (según facturas){tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp} desde DB</span> : null}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          <ModCard num="303" titulo="IVA trimestral" desc={`IVA rep. ${fmt(ivaRep)} − IVA sop. ${fmt(ivaSop)}`} valor={mod303} valorLabel={mod303 > 0 ? 'a pagar' : mod303 < 0 ? 'a compensar' : ''} comp={tcMod303} compLabel={tcMod303 > 0 ? 'a pagar' : tcMod303 < 0 ? 'a compensar' : ''}
                            secciones={[
                              { label: `IVA repercutido — ${fmt(ivaRep)}`, facturas: ing.filter(f => f.impuesto), campoImporte: 'impuesto' },
                              { label: `IVA soportado — ${fmt(ivaSop)}`, facturas: gas.filter(f => f.impuesto), campoImporte: 'impuesto' },
                            ]} />
                          <ModCard num="111" titulo="Retenc. IRPF" desc="IRPF retenido al pagar a terceros" valor={irpf111} valorLabel={irpf111 > 0 ? 'a ingresar' : ''} info={irpf111 === 0} comp={tcMod111}
                            secciones={[
                              { label: 'Gastos con IRPF retenido', facturas: gas.filter(f => (f.irpf || 0) > 0), campoImporte: 'irpf' },
                            ]} />
                          <ModCard num="130" titulo="IRPF fraccionado" desc={`20% s/ beneficio ${fmt(ingBase - gasBase)} (est.)`} valor={mod130} valorLabel="estimado" info={mod130 === 0} comp={tcMod130} compLabel="estimado"
                            secciones={[
                              { label: `Ingresos — base ${fmt(ingBase)}`, facturas: ing, campoImporte: 'importe' },
                              { label: `Gastos — base ${fmt(gasBase)}`, facturas: gas, campoImporte: 'importe' },
                            ]} />
                          <ModCard num="349" titulo="Intracomunitarias" desc="Servicios EU sin IVA (Google, Meta…)" valor={0} info={base349 === 0}
                            secciones={base349 === 0 ? undefined : [{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />
                          {base349 > 0 && <ModCard num="349" titulo="Intracomunitarias" desc={`${intracom.length} operaciones EU`} valor={base349} valorLabel="base declarable"
                            secciones={[{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Input file oculto */}
                  <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e => { handleFiles(e.target.files, tipoActivo); e.target.value = ''; }} />

                  {/* Botón + Añadir / zonas de drop */}
                  {!subirAbierto
                    ? <button onClick={() => setSubirAbierto(true)} style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer', fontWeight:600, marginBottom:12 }}>＋ Añadir facturas</button>
                    : (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
                          {[
                            { tipo:'ingreso', label:'＋ Ingresos', bg:'#052e16', border:'#166534', color:'#22c55e', bgHover:'#0a3f20' },
                            { tipo:'gasto',   label:'＋ Gastos',   bg:'#1a0a0a', border:'#7f1d1d', color:'#f87171', bgHover:'#2a0f0f' },
                          ].map(({ tipo, label, bg, border, color, bgHover }) => (
                            <div key={tipo}
                              onClick={() => { if (!extrayendo) { setTipoActivo(tipo); fileInputRef.current?.click(); } }}
                              onDragOver={e => { e.preventDefault(); setDragOver(tipo); }}
                              onDragLeave={() => setDragOver(null)}
                              onDrop={e => { e.preventDefault(); setDragOver(null); if (!extrayendo) handleFiles(e.dataTransfer.files, tipo); }}
                              style={{ background: dragOver === tipo ? bgHover : bg, border: `2px dashed ${dragOver === tipo ? color : border}`, color, borderRadius:10, padding:'18px 14px', fontSize:13, cursor: extrayendo ? 'not-allowed' : 'pointer', fontWeight:600, textAlign:'center', transition:'all 0.15s', opacity: extrayendo ? 0.6 : 1 }}>
                              {extrayendo && tipoActivo === tipo ? 'Extrayendo…' : label}
                              <div style={{ fontSize:11, fontWeight:400, color: dragOver === tipo ? color : '#52525b', marginTop:4 }}>
                                {dragOver === tipo ? 'Suelta aquí' : 'Haz clic o arrastra PDFs / imágenes'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setSubirAbierto(false)} style={{ background:'none', border:'none', color:'#52525b', fontSize:11, cursor:'pointer', padding:0 }}>Ocultar</button>
                      </div>
                    )
                  }

                  {/* Facturas pendientes de guardar */}
                  {pendientes.length > 0 && (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, marginBottom:12, overflow:'hidden' }}>
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        {(() => { const listos = pendientes.filter(p => !p._procesando && !p._error).length; const proc = pendientes.filter(p => p._procesando).length; return (<>
                          <span style={{ color:'#a78bfa', fontSize:12, fontWeight:600, flex:1 }}>
                            {proc > 0 ? `Procesando ${proc}…` : ''}{proc > 0 && listos > 0 ? ' · ' : ''}{listos > 0 ? `${listos} listo${listos > 1 ? 's' : ''}` : ''}
                          </span>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => setPendientes([])} disabled={guardando}
                              style={{ background:'transparent', color:'#71717a', border:'1px solid #3f3f46', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              Cancelar
                            </button>
                            {listos > 0 && <button onClick={guardarPendientes} disabled={guardando}
                              style={{ background:'#0067FD', color:'white', border:'none', borderRadius:6, padding:'4px 14px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              {guardando ? 'Guardando…' : `Guardar ${listos}`}
                            </button>}
                          </div>
                        </>); })()}
                      </div>
                      {pendientes.map((f, pi) => (
                        <FacturaRow key={pi} f={f} onDelete={() => setPendientes(prev => prev.filter((_,j) => j !== pi))} />
                      ))}
                    </div>
                  )}

                  {/* Facturas ya guardadas */}
                  {facturasGuardadas.length > 0 && (() => {
                    const filtradas = facturasGuardadas
                      .filter(f => facturaFiltro === 'todos' || f.tipo === facturaFiltro)
                      .sort((a, b) => {
                        if (facturaOrden === 'fecha_desc') return (b.fecha_factura || '').localeCompare(a.fecha_factura || '');
                        if (facturaOrden === 'fecha_asc')  return (a.fecha_factura || '').localeCompare(b.fecha_factura || '');
                        if (facturaOrden === 'importe_desc') return (b.importe || 0) - (a.importe || 0);
                        if (facturaOrden === 'importe_asc')  return (a.importe || 0) - (b.importe || 0);
                        return 0;
                      });
                    return (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, overflow:'hidden' }}>
                      {/* Header con controles */}
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <input type="checkbox"
                          checked={filtradas.length > 0 && filtradas.every(f => selFacturas.has(f.id))}
                          onChange={e => {
                            setSelFacturas(prev => {
                              const s = new Set(prev);
                              filtradas.forEach(f => e.target.checked ? s.add(f.id) : s.delete(f.id));
                              return s;
                            });
                          }}
                          style={{ accentColor:'#0067FD', cursor:'pointer', opacity: selFacturas.size > 0 ? 1 : 0.3, transition:'opacity 0.15s' }} />
                        <span style={{ color:'#71717a', fontSize:12, fontWeight:600 }}>
                          Guardadas ({filtradas.length}{filtradas.length !== facturasGuardadas.length ? `/${facturasGuardadas.length}` : ''})
                        </span>
                        {/* Filtro tipo */}
                        <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                          {[['todos','Todos'],['ingreso','Ingresos'],['gasto','Gastos']].map(([v,l]) => (
                            <button key={v} onClick={() => setFacturaFiltro(v)}
                              style={{ background: facturaFiltro===v ? (v==='ingreso'?'#052e16':v==='gasto'?'#1a0a0a':'#27272a') : 'transparent', color: facturaFiltro===v ? (v==='ingreso'?'#22c55e':v==='gasto'?'#f87171':'white') : '#52525b', border: `1px solid ${facturaFiltro===v?(v==='ingreso'?'#166534':v==='gasto'?'#7f1d1d':'#3f3f46'):'transparent'}`, borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                              {l}
                            </button>
                          ))}
                        </div>
                        {/* Ordenación */}
                        <select value={facturaOrden} onChange={e => setFacturaOrden(e.target.value)}
                          style={{ background:'#18181b', color:'#a1a1aa', border:'1px solid #3f3f46', borderRadius:6, padding:'2px 6px', fontSize:11, cursor:'pointer' }}>
                          <option value="fecha_desc">Fecha ↓</option>
                          <option value="fecha_asc">Fecha ↑</option>
                          <option value="importe_desc">Importe ↓</option>
                          <option value="importe_asc">Importe ↑</option>
                        </select>
                        {selFacturas.size > 0 && (
                          <button onClick={eliminarFacturasBulk} disabled={_bulkDeleteFacMut.isPending}
                            style={{ background:'#7f1d1d', border:'1px solid #991b1b', color:'#f87171', borderRadius:6, padding:'3px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            {_bulkDeleteFacMut.isPending ? 'Eliminando…' : `Eliminar ${selFacturas.size}`}
                          </button>
                        )}
                      </div>
                      {filtradas.map(f => <FacturaRow key={f.id} f={f} selectable />)}
                    </div>
                    );
                  })()}

                  {pendientes.length === 0 && facturasGuardadas.length === 0 && !extrayendo && (
                    <p style={{ color:'#3f3f46', fontSize:13, margin:0 }}>Sin facturas. Usa los botones para subir PDFs o imágenes.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Detectar Errores */}
      {erroresModal && createPortal(
        <div onClick={() => { setErroresModal(false); setErrMovDetailId(null); setErrMovEditar(null); setErrFiltro('todos'); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px 16px', overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:740, background:'#161616', border:'1px solid #3f3f46', borderRadius:14, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderBottom:'1px solid #27272a', background:'#111', flexWrap:'wrap' }}>
              <span style={{ color:'#f87171', fontSize:14 }}>⚠</span>
              <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Análisis de conflictos</span>
              {/* Filtros */}
              <div style={{ display:'flex', gap:4, marginLeft:8 }}>
                {[
                  ['todos', 'Todos', '#71717a', '#27272a'],
                  ['error', `${erroresData.filter(c=>c.severidad==='error').length} errores`, '#f87171', '#1a0505'],
                  ['warning', `${erroresData.filter(c=>c.severidad==='warning').length} avisos`, '#fbbf24', '#1a1200'],
                  ['info', `${erroresData.filter(c=>c.severidad==='info').length} info`, '#60a5fa', '#050d1a'],
                ].map(([v, l, col, bg]) => (
                  <button key={v} onClick={() => setErrFiltro(v)}
                    style={{ background: errFiltro===v ? bg : 'transparent', border:`1px solid ${errFiltro===v ? col : '#3f3f46'}`, color: errFiltro===v ? col : '#52525b', borderRadius:6, padding:'2px 9px', fontSize:10, cursor:'pointer', fontWeight:600 }}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={() => { setErroresModal(false); setErrMovDetailId(null); setErrMovEditar(null); setErrFiltro('todos'); }}
                style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'2px 6px', marginLeft:'auto' }}>✕</button>
            </div>

            {(() => {
              const tipoLabel = {
                sin_contacto:          'Factura sin proveedor/cliente vinculado',
                sin_movimiento_vinculado: 'Sin movimiento vinculado',
                sin_movimiento:        'Sin movimiento en DB con datos de factura',
                sin_factura_subida:    'Sin factura subida',
                cross_trimestre:       'Cobro/pago en trimestre diferente al de la factura',
                desfase_fecha:         'Desfase de fecha (mismo trimestre)',
                fecha_factura_distinta:'Fecha de factura diferente (doc vs DB)',
                iva_faltante_db:       'IVA no registrado en DB',
                iva_en_db_sin_factura: 'IVA en DB sin IVA en factura',
                iva_diferente:         'IVA diferente',
                importe_distinto:      'Importe total ≠ total factura',
              };
              const filtrados = errFiltro === 'todos' ? erroresData : erroresData.filter(c => c.severidad === errFiltro);
              if (!filtrados.length) return <div style={{ padding:32, textAlign:'center', color:'#22c55e', fontWeight:600 }}>✓ Sin conflictos en este filtro</div>;
              return filtrados.map((c, ci) => {
                const sevColor = c.severidad === 'error' ? '#f87171' : c.severidad === 'warning' ? '#fbbf24' : '#60a5fa';
                const sevBg    = c.severidad === 'error' ? '#1a0505' : c.severidad === 'warning' ? '#1a1200' : '#050d1a';
                const sevLabel = c.severidad === 'error' ? 'Error' : c.severidad === 'warning' ? 'Aviso' : 'Info';
                const tienePar = c.movimiento && c.factura?.archivo_url;
                const globalIdx = erroresData.indexOf(c);
                // Recomendación: para facturas sin movimiento vinculado, buscar el mejor match
                const recom = c.tipo === 'sin_movimiento_vinculado' && c.factura ? findBestMatch(c.factura) : null;
                return (
                  <div key={ci} style={{ borderBottom:'1px solid #1f1f1f', padding:'12px 18px', background: ci % 2 === 0 ? 'transparent' : '#0a0a0a' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <span style={{ background: sevBg, border:`1px solid ${sevColor}`, color: sevColor, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0, marginTop:1 }}>{sevLabel}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'white', fontWeight:600, fontSize:12, margin:'0 0 2px' }}>{tipoLabel[c.tipo] || c.tipo}</p>
                        <p style={{ color:'#71717a', fontSize:11, margin:'0 0 8px', lineHeight:1.5 }}>{c.desc}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                          {c.movimiento && (
                            <button onClick={() => abrirMovEnErrores(c.movimiento)}
                              style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📋</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.movimiento.nombre}</span>
                              <span style={{ color: c.movimiento.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmt(Math.abs(c.movimiento.cantidad))}€</span>
                            </button>
                          )}
                          {c.factura?.archivo_url && (
                            <button onClick={() => setFacturaViewerId(c.factura.id)}
                              style={{ background:'#050d1a', border:'1px solid #1d4ed8', color:'#60a5fa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📄</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.factura.archivo_nombre}</span>
                            </button>
                          )}
                          {tienePar && (
                            <button onClick={() => setErrSplitView({ movimiento: c.movimiento, factura: c.factura })}
                              style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                              ⬡ Ver ambos
                            </button>
                          )}
                          {/* Recomendación de movimiento para sin_movimiento_vinculado */}
                          {recom && (
                            <>
                              <span style={{ color:'#52525b', fontSize:10, flexShrink:0 }}>→ Recom:</span>
                              <button onClick={() => abrirMovEnErrores(recom)}
                                style={{ background:'#0d1a0d', border:'1px solid #166534', color:'#86efac', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:240, overflow:'hidden' }}>
                                <span style={{ flexShrink:0 }}>📋</span>
                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{recom.nombre}</span>
                                <span style={{ color: recom.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmt(Math.abs(recom.cantidad))}€</span>
                              </button>
                              {c.factura?.archivo_url && (
                                <button onClick={() => setErrSplitView({ movimiento: recom, factura: c.factura })}
                                  style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                                  ⬡ Ver ambos
                                </button>
                              )}
                              <button onClick={async () => {
                                await toggleMovimientoEnFactura(c.factura.id, recom.id);
                                setErroresData(prev => prev.filter((_, i) => i !== globalIdx));
                              }}
                                style={{ background:'rgba(139,92,246,0.15)', border:'1px solid #7c3aed', color:'#a78bfa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontWeight:600 }}>
                                ⚡ Vincular
                              </button>
                            </>
                          )}
                          <button onClick={() => setErroresData(prev => prev.filter((_, i) => i !== globalIdx))}
                            title="Marcar como resuelto"
                            style={{ marginLeft:'auto', background:'transparent', border:'1px solid #27272a', color:'#52525b', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.color='#22c55e'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='#27272a'; e.currentTarget.style.color='#52525b'; }}>
                            ✓ Resuelto
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Movimiento detalle desde errores — zIndex por encima del modal errores */}
      {errMovDetail && createPortal(
        <ModalMovimiento
          m={errMovDetail}
          onClose={() => { setErrMovDetailId(null); const p = new URLSearchParams(window.location.search); p.delete('mov'); window.history.replaceState({}, '', p.toString() ? `${window.location.pathname}?${p}` : window.location.pathname); }}
          onEditar={m => { setErrMovDetailId(null); setErrMovEditar(m); }}
          onEliminar={null}
          onConfirm={() => {}}
          zIndex={9100}
        />,
        document.body
      )}

      {/* Movimiento editar desde errores */}
      {errMovEditar && createPortal(
        <ModalEditar
          movimiento={errMovEditar}
          zIndex={9200}
          onGuardado={(data) => {
            setErroresData(prev => prev.map(c =>
              c.movimiento?.id === errMovEditar.id ? { ...c, movimiento: { ...c.movimiento, ...data } } : c
            ));
            setErrMovEditar(null);
          }}
          onCerrar={() => setErrMovEditar(null)}
        />,
        document.body
      )}

      {/* Split view compartido: movimiento (izq) + factura (der) */}
      <SplitViewModal
        data={errSplitView}
        onClose={() => setErrSplitView(null)}
        onEditarMovimiento={m => { setErrMovEditar(m); setErrSplitView(null); }}
        onEditarFactura={fac => { setFacturaViewerId(fac.id); setFacturaViewerAutoEdit(true); setErrSplitView(null); }}
        zIndex={9300}
      />

      {/* Modal detalle modelo Hacienda */}
      {modDetalle && createPortal(
        <div onClick={() => setModDetalle(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111', border:'1px solid #3f3f46', borderRadius:12, width:'100%', maxWidth:700, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ background:'#1a1a1a', border:'1px solid #52525b', borderRadius:4, color:'#a78bfa', fontSize:11, fontWeight:700, padding:'2px 8px' }}>Mod.{modDetalle.num}</span>
              <span style={{ color:'#e4e4e7', fontSize:14, fontWeight:600 }}>{modDetalle.titulo}</span>
              <button onClick={() => setModDetalle(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px' }}>✕</button>
            </div>
            {/* Descripción + valor */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <p style={{ color:'#71717a', fontSize:12, margin:'0 0 8px' }}>{modDetalle.desc}</p>
              {!modDetalle.info && (
                <span style={{ color: modDetalle.valor > 0 ? '#f87171' : modDetalle.valor < 0 ? '#22c55e' : '#52525b', fontSize:22, fontWeight:700 }}>
                  {modDetalle.valor < 0 ? '−' : ''}{fmt(Math.abs(modDetalle.valor))}
                  {modDetalle.valorLabel && <span style={{ color:'#71717a', fontSize:12, fontWeight:400, marginLeft:6 }}>{modDetalle.valorLabel}</span>}
                </span>
              )}
              {modDetalle.info && <span style={{ color:'#52525b', fontSize:14, fontWeight:600 }}>Informativo</span>}
            </div>
            {/* Secciones de facturas */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {modDetalle.secciones?.map((sec, si) => (
                <div key={si}>
                  <div style={{ padding:'8px 16px', background:'#0d0d0d', borderBottom:'1px solid #27272a', position:'sticky', top:0 }}>
                    <span style={{ color:'#a1a1aa', fontSize:11, fontWeight:700 }}>{sec.label}</span>
                  </div>
                  {sec.facturas.length === 0
                    ? <p style={{ color:'#3f3f46', fontSize:12, padding:'10px 16px', margin:0 }}>Sin facturas</p>
                    : sec.facturas.map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid #18181b' }}>
                        {/* Doc clicable */}
                        <div style={{ flex:'0 0 20px' }}>
                          {f.archivo_url
                            ? <button onClick={() => setFacturaViewerId(f.id)}
                                style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:'#60a5fa', fontSize:14, lineHeight:1 }} title="Ver documento">📄</button>
                            : <span style={{ color:'#3f3f46', fontSize:14 }}>—</span>
                          }
                        </div>
                        {/* Entidad */}
                        <span style={{ flex:2, color:'#d4d4d8', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {f.nombre_entidad || f.archivo_nombre || '—'}
                        </span>
                        {/* Fecha */}
                        <span style={{ flex:'0 0 80px', color:'#71717a', fontSize:11 }}>{f.fecha_factura || '—'}</span>
                        {/* Nº factura */}
                        <span style={{ flex:'0 0 90px', color:'#52525b', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.numero_factura || '—'}</span>
                        {/* Importe relevante */}
                        <span style={{ flex:'0 0 80px', textAlign:'right', color:'#a1a1aa', fontSize:12, fontWeight:600 }}>
                          {fmt(Math.abs(f[sec.campoImporte] || 0))}
                        </span>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
