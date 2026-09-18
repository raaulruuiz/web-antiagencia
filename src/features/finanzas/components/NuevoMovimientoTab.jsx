import { useState, useRef, useMemo } from 'react';
import { useClientesLista, useEquipoLista, useProveedoresLista } from '@/features/finanzas';
import { BACKEND_URL } from '@/lib/config';
import { getToken } from '../utils';
import { S, CUENTAS, CATEGORIAS } from '../constants';
import { MultiCheckDrop } from './MultiCheckDrop';
import { FormularioMovimiento } from './FormularioMovimiento';

// ── Tab Nuevo: manual o desde imagen ───────────────────────────
export function NuevoMovimientoTab({ onGuardado }) {
  const [modo, setModo] = useState('imagen');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  // sections: null | [{ previewUrl, movimientos: [...], guardados: Set<number>, error? }]
  const [sections, setSections] = useState(null);
  const [pagina, setPagina] = useState(0); // página actual en el modo de revisión
  const [extrayendoIdx, setExtrayendoIdx] = useState(null); // which image is being processed
  const [guardandoKey, setGuardandoKey] = useState(null); // 'si-mi'
  const { data: clientesListaRaw = [] } = useClientesLista();
  const { data: equipoListaRaw = [] } = useEquipoLista();
  const { data: proveedoresListaRaw = [] } = useProveedoresLista();
  const clientesLista = useMemo(() => clientesListaRaw.map(c => ({ id: c.id, label: c.nombre + (c.nombre_empresa ? ` (${c.nombre_empresa})` : '') })), [clientesListaRaw]);
  const equipoLista = useMemo(() => equipoListaRaw.map(e => ({ id: e.id, label: e.nombre })), [equipoListaRaw]);
  const proveedoresLista = useMemo(() => proveedoresListaRaw.map(p => ({ id: p.id, label: p.nombre + (p.nombre_empresa ? ` (${p.nombre_empresa})` : '') })), [proveedoresListaRaw]);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);
  const [nuevasCats, setNuevasCats] = useState({}); // { 'si-mi': texto | undefined }

  const CUENTAS_LIST = CUENTAS.map(c => c.key);

  function detectarCuentaSec(movimientos) {
    if (!movimientos.length) return 'Gastos de Operación';
    const freq = {};
    movimientos.forEach(m => { freq[m.cuenta] = (freq[m.cuenta] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }

  function setCuentaSec(si, cuenta) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, cuentaSec: cuenta,
      movimientos: s.movimientos.map(m => ({ ...m, cuenta })),
    }));
  }


  function onFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setSections(null);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3f3f46';
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setSections(null);
  }

  function resetear() {
    setSections(null);
    setPagina(0);
    setImagenes([]);
    setPreviews([]);
    setDesde('');
    setHasta('');
  }

  async function extraer() {
    if (!imagenes.length) return;
    cancelRef.current = false;
    setSections([]);
    for (let i = 0; i < imagenes.length; i++) {
      if (cancelRef.current) break;
      setExtrayendoIdx(i);
      let seccion;
      try {
        const token = await getToken();
        const fd = new FormData();
        fd.append('imagenes', imagenes[i]);
        if (desde) fd.append('desde', desde);
        if (hasta) fd.append('hasta', hasta);
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/extraer-imagen`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error');
        const movimientos = (data.movements || []).map(m => ({
          nombre: m.name || '',
          fecha: m.date || new Date().toISOString().slice(0,10),
          tipo: m.type || 'Gasto',
          cuenta: m.account || 'Gastos de Operación',
          cantidad: String(m.amount_eur || ''),
          iva: m.iva || '0%',
          irpf: m.irpf || '0%',
          categorias: [], cliente_ids: [], equipo_ids: [], proveedor_ids: [],
          fecha_factura: '', importe_factura: '',
        }));
        const cuentaSec = detectarCuentaSec(movimientos);
        const movNorm = movimientos.map(m => ({ ...m, cuenta: cuentaSec }));
        seccion = { previewUrl: previews[i], movimientos: movNorm, guardados: new Set(), cuentaSec };
      } catch (err) {
        seccion = { previewUrl: previews[i], movimientos: [], guardados: new Set(), cuentaSec: 'Gastos de Operación', error: err.message };
      }
      // Añadir la sección al final (sin tocar las anteriores — preserva ediciones del usuario)
      setSections(prev => [...prev, seccion]);
      if (i === 0) setPagina(0); // primera imagen lista: muestra al usuario para que empiece a revisar
    }
    setExtrayendoIdx(null);
  }

  function setMovField(si, mi, key, val) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, movimientos: s.movimientos.map((m, j) => j !== mi ? m : { ...m, [key]: val }),
    }));
  }

  function eliminarMov(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, movimientos: s.movimientos.filter((_, j) => j !== mi),
    }));
  }

  // Marca un movimiento como "revisado" localmente (sin guardar en BD)
  function marcarRevisado(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, guardados: new Set([...s.guardados, mi]),
    }));
  }

  // Reabre un movimiento ya marcado para editarlo
  function desmarcarRevisado(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, guardados: new Set([...s.guardados].filter(j => j !== mi)),
    }));
  }

  // Guarda TODOS los movimientos en BD de una vez
  async function guardarTodos() {
    if (!sections) return;
    setGuardandoKey('todos');
    try {
      const token = await getToken();
      for (let si = 0; si < sections.length; si++) {
        for (let mi = 0; mi < sections[si].movimientos.length; mi++) {
          const m = sections[si].movimientos[mi];
          if (!m.nombre || !m.cantidad) continue;
          const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimiento`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...m, cantidad: parseFloat(m.cantidad),
              fecha_factura: m.fecha_factura || null,
              importe_factura: m.importe_factura ? parseFloat(m.importe_factura) : null,
            }),
          });
          if (!r.ok) throw new Error(await r.text());
        }
      }
      fetch(`${BACKEND_URL}/admin/finanzas/completar-tracking-diario`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then(d => {
        if (d.completadas > 0) console.log(`✅ ${d.completadas} tarea(s) "Tracking diario" marcadas en Notion`);
      }).catch(() => {});
      onGuardado();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
      setGuardandoKey(null);
    }
  }

  const totalRevisados = sections ? sections.reduce((acc, s) => acc + s.guardados.size, 0) : 0;
  const totalMovs = sections ? sections.reduce((acc, s) => acc + s.movimientos.length, 0) : 0;
  const hayMovimientos = sections && totalMovs > 0;
  const procesando = extrayendoIdx !== null;

  const btnTab = (t, label) => (
    <button type="button" onClick={() => setModo(t)}
      style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        background: modo === t ? '#0067FD' : '#27272a', color: modo === t ? 'white' : '#71717a' }}>
      {label}
    </button>
  );

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0, flex: 1 }}>Nuevo movimiento</h2>
        {!sections && (
          <div style={{ display: 'flex', gap: 6, background: '#1c1c1e', padding: 4, borderRadius: 10 }}>
            {btnTab('imagen', '📷 Desde imagen')}
            {btnTab('manual', '✏️ Manual')}
          </div>
        )}
      </div>

      {modo === 'manual' && (
        <FormularioMovimiento onGuardado={onGuardado} />
      )}

      {/* ── SUBIDA ── */}
      {modo === 'imagen' && !sections && (
        <div>
          {/* Rango de fechas — siempre visible y obligatorio */}
          <div style={{ marginBottom: 16, padding: 14, background: '#1c1c1e', borderRadius: 10, border: `1px solid ${(!desde || !hasta) ? '#3f3f46' : '#22c55e33'}` }}>
            <p style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Rango de fechas del extracto
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={S.label}>Desde *</label>
                <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={desde} onChange={e => setDesde(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Hasta *</label>
                <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </div>
            </div>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0067FD'; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#3f3f46'; }}
            onDrop={onDrop}
            style={{ border: '2px dashed #3f3f46', borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <p style={{ color: '#71717a', fontSize: 32, margin: '0 0 8px' }}>📷</p>
            <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
              {imagenes.length > 0 ? `${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''} seleccionada${imagenes.length > 1 ? 's' : ''}` : 'Arrastra o haz clic para subir'}
            </p>
            <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>Capturas bancarias, tickets o facturas · JPG, PNG · Máx 10 MB cada una</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: 'none' }} />

          {imagenes.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {previews.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={imagenes[i]?.name}
                    style={{ height: 72, width: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #3f3f46', display: 'block' }} />
                  <button type="button"
                    onClick={() => {
                      setImagenes(prev => prev.filter((_, j) => j !== i));
                      setPreviews(prev => prev.filter((_, j) => j !== i));
                    }}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#27272a', border: '1px solid #52525b', color: '#a1a1aa', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {(() => {
            const listo = imagenes.length > 0 && desde && hasta && !procesando;
            const motivo = !desde || !hasta ? 'Rellena el rango de fechas' : !imagenes.length ? 'Sube al menos una imagen' : null;
            return (
              <button type="button" onClick={listo ? extraer : undefined} disabled={!listo}
                title={motivo || ''}
                style={{ marginTop: 12, background: listo ? '#0067FD' : '#27272a', color: listo ? 'white' : '#52525b', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: listo ? 'pointer' : 'not-allowed', width: '100%' }}>
                {procesando
                  ? `⏳ Analizando imagen ${(extrayendoIdx ?? 0) + 1} de ${imagenes.length}...`
                  : motivo
                    ? `🔍 Extraer movimientos — ${motivo}`
                    : `🔍 Extraer movimientos${imagenes.length > 1 ? ` (${imagenes.length} imágenes)` : ''}`
                }
              </button>
            );
          })()}
        </div>
      )}

      {/* ── RESULTADOS (paginado por imagen) ── */}
      {modo === 'imagen' && sections !== null && (() => {
        const si = pagina;
        const sec = sections[si];
        const guardadosPagina = sec ? sec.guardados.size : 0;
        const movsPagina = sec ? sec.movimientos.length : 0;
        const hayPendientesPagina = sec && guardadosPagina < movsPagina;
        return (
          <div>
            {/* Cabecera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {procesando
                ? <>
                    <span style={{ color: '#facc15', fontSize: 13, fontWeight: 600 }}>⏳ Analizando imagen {(extrayendoIdx ?? 0) + 1} de {imagenes.length}...</span>
                    <button type="button" onClick={() => { cancelRef.current = true; setExtrayendoIdx(null); }}
                      style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </>
                : <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>✓ {totalMovs} movimiento{totalMovs !== 1 ? 's' : ''} de {sections.length} imagen{sections.length !== 1 ? 'es' : ''}</span>
              }
              <button type="button" onClick={resetear}
                style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                ← Nueva imagen
              </button>
              {!procesando && hayMovimientos && (
                <button type="button" onClick={guardarTodos} disabled={guardandoKey === 'todos'}
                  style={{ marginLeft: 'auto', background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: guardandoKey === 'todos' ? 'not-allowed' : 'pointer' }}>
                  {guardandoKey === 'todos' ? 'Guardando...' : `Guardar todos (${totalMovs})`}
                </button>
              )}
            </div>

            {/* Paginación */}
            {sections.length > 1 && (() => {
              const total = sections.length;
              const btnPag = (i) => {
                const guardadoTodo = sections[i] && sections[i].guardados.size === sections[i].movimientos.length && sections[i].movimientos.length > 0;
                return (
                  <button key={i} type="button" onClick={() => setPagina(i)}
                    style={{ padding: '5px 11px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      background: i === si ? '#0067FD' : '#27272a',
                      color: i === si ? 'white' : sections[i] ? (guardadoTodo ? '#22c55e' : '#a1a1aa') : '#52525b',
                    }}>
                    {i + 1}{guardadoTodo ? ' ✓' : ''}
                  </button>
                );
              };
              // Ventana deslizante: siempre mostrar 1, ..., [si-2..si+2], ..., total
              const window = 2;
              const indices = new Set([0, total - 1]);
              for (let k = Math.max(0, si - window); k <= Math.min(total - 1, si + window); k++) indices.add(k);
              const sorted = [...indices].sort((a, b) => a - b);
              const items = [];
              sorted.forEach((idx, pos) => {
                if (pos > 0 && idx - sorted[pos - 1] > 1) {
                  items.push(<span key={`dots-${idx}`} style={{ color: '#52525b', fontSize: 12, padding: '0 2px' }}>…</span>);
                }
                items.push(btnPag(idx));
              });
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'nowrap' }}>
                  <button type="button" onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={si === 0}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #3f3f46', background: 'none', color: si === 0 ? '#3f3f46' : '#a1a1aa', cursor: si === 0 ? 'default' : 'pointer', fontSize: 13, flexShrink: 0 }}>
                    ‹
                  </button>
                  {items}
                  <button type="button" onClick={() => setPagina(p => Math.min(total - 1, p + 1))} disabled={si === total - 1}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #3f3f46', background: 'none', color: si === total - 1 ? '#3f3f46' : '#a1a1aa', cursor: si === total - 1 ? 'default' : 'pointer', fontSize: 13, flexShrink: 0 }}>
                    ›
                  </button>
                </div>
              );
            })()}

            {sec && (
              <div>
                {/* Imagen */}
                <div style={{ marginBottom: 14 }}>
                  <img src={sec.previewUrl} alt={`Imagen ${si + 1}`}
                    style={{ width: '100%', maxHeight: 640, objectFit: 'contain', display: 'block', borderRadius: 10, border: '1px solid #27272a', background: '#0d0d0d' }} />
                </div>

                {/* Selector de cuenta a nivel de sección */}
                {sec.movimientos.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: '#1c1c1e', borderRadius: 10, border: '1px solid #27272a' }}>
                    <span style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cuenta de esta imagen</span>
                    <select value={sec.cuentaSec || ''} onChange={e => setCuentaSec(si, e.target.value)}
                      style={{ ...S.input, maxWidth: 260, margin: 0 }}>
                      {CUENTAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Error de parsing */}
                {sec.error && (
                  <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 10 }}>
                    No se pudieron extraer movimientos de esta imagen
                  </div>
                )}

                {sec.movimientos.length === 0 && !sec.error && !procesando && (
                  <p style={{ color: '#52525b', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin movimientos detectados</p>
                )}
                {procesando && si === extrayendoIdx && sec.movimientos.length === 0 && !sec.error && (
                  <p style={{ color: '#71717a', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Analizando...</p>
                )}

                {/* Botón marcar todos de esta imagen como listos */}
                {!procesando && hayPendientesPagina && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button type="button" onClick={() => setSections(prev => prev.map((s, i) => i !== si ? s : { ...s, guardados: new Set(s.movimientos.map((_, mi) => mi)) }))}
                      style={{ background: '#27272a', color: '#a1a1aa', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Marcar imagen {si + 1} como lista
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sec.movimientos.map((m, mi) => {
                    const guardado = sec.guardados.has(mi);
                    const thisKey = `${si}-${mi}`;
                    return (
                      <div key={mi} style={{ background: '#1c1c1e', borderRadius: 10, padding: 14, border: `1px solid ${guardado ? '#22c55e33' : '#27272a'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: guardado ? 0 : 12,
                          cursor: guardado ? 'pointer' : 'default' }}
                          onClick={guardado ? () => desmarcarRevisado(si, mi) : undefined}>
                          <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontWeight: 700, fontSize: 15 }}>
                            {m.tipo === 'Ingreso' ? '+' : '-'}{m.cantidad} €
                          </span>
                          <span style={{ color: '#71717a', fontSize: 12, flex: 1 }}>{m.nombre} · {m.fecha}</span>
                          {guardado
                            ? <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Listo · clic para editar</span>
                            : <>
                                <button type="button" onClick={e => { e.stopPropagation(); marcarRevisado(si, mi); }}
                                  style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                  ✓ Listo
                                </button>
                                <button type="button" onClick={e => { e.stopPropagation(); eliminarMov(si, mi); }}
                                  style={{ background: 'none', border: 'none', color: '#52525b', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                              </>
                          }
                        </div>
                        {!guardado && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div style={{ gridColumn: '1/-1' }}>
                              <label style={S.label}>Nombre</label>
                              <input style={S.input} value={m.nombre} onChange={e => setMovField(si, mi, 'nombre', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Fecha</label>
                              <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={m.fecha} onChange={e => setMovField(si, mi, 'fecha', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Cantidad (€)</label>
                              <input style={S.input} type="number" step="0.01" value={m.cantidad} onChange={e => setMovField(si, mi, 'cantidad', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Tipo</label>
                              <select style={S.input} value={m.tipo} onChange={e => setMovField(si, mi, 'tipo', e.target.value)}>
                                <option>Ingreso</option><option>Gasto</option>
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>Cuenta</label>
                              <select style={S.input} value={m.cuenta} onChange={e => setMovField(si, mi, 'cuenta', e.target.value)}>
                                {CUENTAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>IVA</label>
                              <select style={S.input} value={m.iva} onChange={e => setMovField(si, mi, 'iva', e.target.value)}>
                                {['0%','4%','10%','21%'].map(v => <option key={v}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>IRPF</label>
                              <select style={S.input} value={m.irpf} onChange={e => setMovField(si, mi, 'irpf', e.target.value)}>
                                {['0%','7%','15%','19%'].map(v => <option key={v}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>Fecha factura</label>
                              <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={m.fecha_factura} onChange={e => setMovField(si, mi, 'fecha_factura', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Importe factura (€)</label>
                              <input style={S.input} type="number" step="0.01" value={m.importe_factura} onChange={e => setMovField(si, mi, 'importe_factura', e.target.value)} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                              <label style={S.label}>Categorías</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                {CATEGORIAS.map(cat => {
                                  const sel = m.categorias.includes(cat);
                                  return (
                                    <button key={cat} type="button"
                                      onClick={() => setMovField(si, mi, 'categorias', sel ? m.categorias.filter(c => c !== cat) : [...m.categorias, cat])}
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                                        background: sel ? '#0067FD' : '#27272a', color: sel ? 'white' : '#71717a' }}>
                                      {cat}
                                    </button>
                                  );
                                })}
                                {/* Categorías personalizadas ya añadidas */}
                                {m.categorias.filter(c => !CATEGORIAS.includes(c)).map(cat => (
                                  <button key={cat} type="button"
                                    onClick={() => setMovField(si, mi, 'categorias', m.categorias.filter(c => c !== cat))}
                                    style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid #0067FD',
                                      background: '#0067FD22', color: '#60a5fa' }}>
                                    {cat} ✕
                                  </button>
                                ))}
                                {/* Botón + nueva categoría */}
                                {nuevasCats[thisKey] !== undefined
                                  ? <input autoFocus value={nuevasCats[thisKey] || ''}
                                      onChange={e => setNuevasCats(prev => ({ ...prev, [thisKey]: e.target.value }))}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const cat = (nuevasCats[thisKey] || '').trim();
                                          if (cat) setMovField(si, mi, 'categorias', [...m.categorias, cat]);
                                          setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                        }
                                        if (e.key === 'Escape') setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                      }}
                                      onBlur={() => {
                                        const cat = (nuevasCats[thisKey] || '').trim();
                                        if (cat) setMovField(si, mi, 'categorias', [...m.categorias, cat]);
                                        setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                      }}
                                      placeholder="Escribe y Enter"
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#1c1c1e', border: '1px dashed #3f3f46', color: 'white', outline: 'none', width: 140 }}
                                    />
                                  : <button type="button"
                                      onClick={() => setNuevasCats(prev => ({ ...prev, [thisKey]: '' }))}
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px dashed #3f3f46', background: 'none', color: '#52525b' }}>
                                      + Nueva
                                    </button>
                                }
                              </div>
                            </div>
                            {clientesLista.length > 0 && (
                              <div>
                                <MultiCheckDrop label="Clientes" opciones={clientesLista} seleccionados={m.cliente_ids} onChange={val => setMovField(si, mi, 'cliente_ids', val)} />
                              </div>
                            )}
                            {equipoLista.length > 0 && (
                              <div>
                                <MultiCheckDrop label="Equipo" opciones={equipoLista} seleccionados={m.equipo_ids} onChange={val => setMovField(si, mi, 'equipo_ids', val)} />
                              </div>
                            )}
                            {proveedoresLista.length > 0 && (
                              <div>
                                <MultiCheckDrop label="Proveedores" opciones={proveedoresLista} seleccionados={m.proveedor_ids || []} onChange={val => setMovField(si, mi, 'proveedor_ids', val)} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
