import { DateRangePicker } from './DateRangePicker';
import { S } from '../constants';
import { fmt } from '../utils';

export function ClientesTab({
  desde, setDesde, hasta, setHasta, clientes, loadingClientes,
  clienteAbierto, setClienteAbierto, clienteBusqueda, setClienteBusqueda,
  clienteSort, setClienteSort,
  eliminarContacto, setModalContacto, setConfirmDialog, abrirDetalle, setFacturaViewerId,
  contactoTabInner, setContactoTabInner,
  movFiltroTipo, setMovFiltroTipo, movPagina, setMovPagina, movPorPagina, setMovPorPagina,
  docFiltroTipo, setDocFiltroTipo, docContactoPagina, setDocContactoPagina,
  docContactoPorPagina, setDocContactoPorPagina,
}) {
        const beneficioSinTraspasos = c => {
          const movs = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          return movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0)
               - movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
        };
        const getValorSort = (c, campo) => {
          const movs = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const ing  = movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0);
          const gas  = movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
          if (campo === 'facturacion') return ing;
          if (campo === 'gasto') return gas;
          return ing - gas; // beneficio
        };
        const sortClientes = arr => [...arr].sort((a, b) => {
          const va = getValorSort(a, clienteSort.campo);
          const vb = getValorSort(b, clienteSort.campo);
          return clienteSort.dir === 'desc' ? vb - va : va - vb;
        });
        const buscarFiltro = arr => {
          const q = clienteBusqueda.trim().toLowerCase();
          if (!q) return arr;
          return arr.filter(c =>
            c.nombre.toLowerCase().includes(q) ||
            (c.nombre_empresa || '').toLowerCase().includes(q)
          );
        };
        const yo        = buscarFiltro(clientes.filter(c => c.nombre === 'Anti-Agencia'));
        const activos   = sortClientes(buscarFiltro(clientes.filter(c => c.activo  && c.nombre !== 'Anti-Agencia')));
        const inactivos = sortClientes(buscarFiltro(clientes.filter(c => !c.activo && c.nombre !== 'Anti-Agencia')));

        const renderCliente = (c) => {
          const abierto   = clienteAbierto === c.id;
          const movsFiltered = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const tieneMovs = movsFiltered.length > 0;
          const cantidadPro = m => m.cantidad / Math.max(m.cliente_ids?.length || 1, 1);
          const ingresos  = movsFiltered.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + cantidadPro(m), 0);
          const gastos    = movsFiltered.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + cantidadPro(m), 0);
          const balance   = ingresos - gastos;
          return (
            <div key={c.id} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                <span onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); }}
                  style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none', cursor: 'pointer' }}>▶</span>
                <div onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); }}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{c.nombre}</span>
                  {c.nombre_empresa && c.nombre_empresa !== c.nombre && (
                    <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{c.nombre_empresa}</span>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); setModalContacto({ tipo: 'cliente', datos: c }); }}
                  style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Editar
                </button>
                <button onClick={e => { e.stopPropagation(); setConfirmDialog({ texto: `¿Eliminar cliente "${c.nombre}"?`, onOk: () => eliminarContacto(c.id, 'cliente') }); }}
                  style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Eliminar
                </button>
                <div onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); }}
                  style={{ display: 'flex', gap: 16, flexShrink: 0, cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{fmt(ingresos)}</span>
                  <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>{fmt(-gastos)}</span>
                  <span style={{ fontSize: 13, color: balance >= 0 ? '#60a5fa' : '#fb923c', fontWeight: 600 }}>{fmt(balance)}</span>
                </div>
              </div>

              {abierto && (
                <div style={{ borderTop: '1px solid #27272a', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Ingresos', val: ingresos,  color: '#22c55e' },
                      { label: 'Gastos',   val: -gastos,   color: '#f87171' },
                      { label: 'Balance',  val: balance, color: balance >= 0 ? '#60a5fa' : '#fb923c' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ ...S.card, padding: '10px 16px', flex: 1, minWidth: 100 }}>
                        <p style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
                        <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0 }}>{fmt(val)}</p>
                      </div>
                    ))}
                  </div>
                  {(c.nif_cif || c.email) && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                      {c.nif_cif && <span style={{ color: '#71717a', fontSize: 12 }}>NIF: <span style={{ color: '#a1a1aa' }}>{c.nif_cif}</span></span>}
                      {c.email   && <span style={{ color: '#71717a', fontSize: 12 }}>Email: <span style={{ color: '#a1a1aa' }}>{c.email}</span></span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #27272a' }}>
                    {[['movimientos', 'Movimientos'], ['documentos', 'Documentos']].map(([t, label]) => (
                      <button key={t} onClick={() => { setContactoTabInner(t); setDocFiltroTipo('todos'); }}
                        style={{ background: 'none', border: 'none', borderBottom: contactoTabInner === t ? '2px solid #60a5fa' : '2px solid transparent', color: contactoTabInner === t ? '#60a5fa' : '#71717a', padding: '6px 14px 8px', fontSize: 13, cursor: 'pointer', fontWeight: contactoTabInner === t ? 600 : 400 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {contactoTabInner === 'movimientos' && (!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
{['todos', 'Ingreso', 'Gasto'].map(t => (
                            <button key={t} onClick={() => { setMovFiltroTipo(t); setMovPagina(1); }}
                              style={{ background: movFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: movFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'Ingreso' ? 'Ingresos' : 'Gastos'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{totalMovs} movimientos</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {movsPag.map(m => (
                            <div key={m.id} onClick={() => abrirDetalle(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: 'pointer' }}>
                              <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{m.fecha}</span>
                              <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</span>
                              {(m.categorias || []).slice(0, 2).map(cat => (
                                <span key={cat} style={{ background: '#27272a', color: '#71717a', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{cat}</span>
                              ))}
                              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 70 }}>
                                <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 13, fontWeight: 600 }}>
                                  {fmt(m.tipo === 'Ingreso' ? m.cantidad : -m.cantidad)}
                                </span>
                                {(m.cliente_ids?.length || 1) > 1 && (
                                  <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 10, opacity: 0.7 }}>
                                    corr. {fmt(cantidadPro(m))}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Controles paginación */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          <select value={movPorPagina} onChange={e => { setMovPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setMovPagina(1); }}
                            style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                            {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                            <option value="todos">Todos</option>
                          </select>
                          {movPorPagina !== 'todos' && paginas > 1 && (
                            <>
                              <button onClick={() => setMovPagina(p => Math.max(1, p - 1))} disabled={movPagina === 1}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                              <span style={{ color: '#71717a', fontSize: 12 }}>{movPagina} / {paginas}</span>
                              <button onClick={() => setMovPagina(p => Math.min(paginas, p + 1))} disabled={movPagina === paginas}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })())}
                  {contactoTabInner === 'documentos' && (() => {
                    const docsFiltered = (c.facturas || []).filter(d => docFiltroTipo === 'todos' || d.tipo === docFiltroTipo);
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {['todos', 'gasto', 'ingreso'].map(t => (
                            <button key={t} onClick={() => { setDocFiltroTipo(t); setDocContactoPagina(1); }}
                              style={{ background: docFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: docFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'gasto' ? 'Compras' : 'Ventas'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{docsFiltered.length} documento{docsFiltered.length !== 1 ? 's' : ''}</span>
                        </div>
                        {docsFiltered.length === 0 ? (
                          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin documentos asignados.</p>
                        ) : (() => {
                          const totalDocs = docsFiltered.length;
                          const paginasDoc = docContactoPorPagina === 'todos' ? 1 : Math.ceil(totalDocs / docContactoPorPagina);
                          const docsPag = docContactoPorPagina === 'todos' ? docsFiltered : docsFiltered.slice((docContactoPagina - 1) * docContactoPorPagina, docContactoPagina * docContactoPorPagina);
                          return (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {docsPag.map(doc => (
                                  <div key={doc.id} onClick={() => doc.archivo_url && setFacturaViewerId(doc.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: doc.archivo_url ? 'pointer' : 'default' }}>
                                    <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{doc.fecha_factura || '—'}</span>
                                    <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.numero_factura || doc.archivo_nombre || '—'}</span>
                                    <span style={{ background: doc.tipo === 'ingreso' ? '#14532d' : '#450a0a', color: doc.tipo === 'ingreso' ? '#4ade80' : '#f87171', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                                      {doc.tipo === 'ingreso' ? 'Venta' : 'Compra'}
                                    </span>
                                    {doc.importe != null && <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{fmt(doc.importe)}</span>}
                                    {doc.archivo_url && <span style={{ color: '#60a5fa', fontSize: 12, flexShrink: 0 }}>📄</span>}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                <select value={docContactoPorPagina} onChange={e => { setDocContactoPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setDocContactoPagina(1); }}
                                  style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                                  {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                  <option value="todos">Todos</option>
                                </select>
                                {docContactoPorPagina !== 'todos' && paginasDoc > 1 && (
                                  <>
                                    <button onClick={() => setDocContactoPagina(p => Math.max(1, p - 1))} disabled={docContactoPagina === 1}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                                    <span style={{ color: '#71717a', fontSize: 12 }}>{docContactoPagina} / {paginasDoc}</span>
                                    <button onClick={() => setDocContactoPagina(p => Math.min(paginasDoc, p + 1))} disabled={docContactoPagina === paginasDoc}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                                  </>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        };

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={(d, h) => { setDesde(d); setHasta(h); }} />
              <button
                onClick={() => setModalContacto({ tipo: 'cliente', datos: null })}
                style={{ background: '#0067FD', border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
              >＋ Nuevo cliente</button>

              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar cliente…"
                value={clienteBusqueda}
                onChange={e => setClienteBusqueda(e.target.value)}
                style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', width: 180 }}
              />

              {/* Ordenar por */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '4px 6px' }}>
                <span style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: 4 }}>Ordenar</span>
                {[
                  { key: 'beneficio',   label: 'Beneficio' },
                  { key: 'facturacion', label: 'Facturación' },
                  { key: 'gasto',       label: 'Gasto' },
                ].map(({ key, label }) => (
                  <button key={key}
                    onClick={() => setClienteSort(s => s.campo === key ? { campo: key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { campo: key, dir: 'desc' })}
                    style={{
                      background: clienteSort.campo === key ? '#3f3f46' : 'transparent',
                      border: 'none', color: clienteSort.campo === key ? 'white' : '#71717a',
                      borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                    }}>
                    {label}{clienteSort.campo === key ? (clienteSort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {loadingClientes ? (
              <p style={{ color: '#71717a', fontSize: 14 }}>Cargando clientes…</p>
            ) : clientes.length === 0 ? (
              <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay clientes. Pulsa «＋ Nuevo cliente» para añadir.</p>
              </div>
            ) : (
              <>
                {yo.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Yo
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {yo.map(renderCliente)}
                    </div>
                  </div>
                )}
                {activos.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Activos <span style={{ color: '#22c55e' }}>({activos.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activos.map(renderCliente)}
                    </div>
                  </div>
                )}
                {inactivos.length > 0 && (
                  <div>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Inactivos <span style={{ color: '#f87171' }}>({inactivos.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inactivos.map(renderCliente)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
}
