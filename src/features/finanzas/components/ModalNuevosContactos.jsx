export function ModalNuevosContactos({
  modalNuevosContactos, setModalNuevosContactos, confirmandoContactos, setConfirmandoContactos,
  contactosTodos, qc,
}) {
  if (!modalNuevosContactos) return null;
  return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setModalNuevosContactos(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#18181b', border:'1px solid #3f3f46', borderRadius:14, width:'100%', maxWidth:720, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#fbbf24', fontSize:18 }}>⚠️</span>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontWeight:700, color:'#f4f4f5', fontSize:15 }}>Contactos nuevos detectados</p>
                <p style={{ margin:0, color:'#71717a', fontSize:12 }}>Se han guardado las facturas. Estos contactos no estaban en tu lista. Revísalos antes de confirmar.</p>
              </div>
              <button onClick={() => setModalNuevosContactos(null)} style={{ background:'none', border:'none', color:'#52525b', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ overflowY:'auto', flex:1, padding:'14px 22px', display:'flex', flexDirection:'column', gap:12 }}>
              {modalNuevosContactos.map((item, idx) => {
                const update = patch => setModalNuevosContactos(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
                const contactosFiltrados = item._busqueda
                  ? contactosTodos.filter(c => c.nombre?.toLowerCase().includes(item._busqueda.toLowerCase()) || c.nombre_empresa?.toLowerCase().includes(item._busqueda.toLowerCase()))
                  : [];
                return (
                  <div key={idx} style={{ background: item._ignorar ? '#111' : '#1c1c1e', border:`1px solid ${item._ignorar ? '#27272a' : '#3f3f46'}`, borderRadius:10, padding:'14px 16px', opacity: item._ignorar ? 0.4 : 1 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:'0 0 2px', color:'#f4f4f5', fontWeight:600, fontSize:14 }}>{item.nombre_entidad}</p>
                        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                          {item.nif_cif && <span style={{ color:'#71717a', fontSize:12 }}>NIF: <span style={{ color:'#a1a1aa' }}>{item.nif_cif}</span></span>}
                          <span style={{ color:'#71717a', fontSize:12 }}>Tipo: <span style={{ color: item.tipo === 'ingreso' ? '#22c55e' : '#f87171' }}>{item.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</span></span>
                          <span style={{ color:'#71717a', fontSize:12 }}>{item.factura_ids?.length} factura{item.factura_ids?.length !== 1 ? 's' : ''}</span>
                          {item.archivo_url && <a href={item.archivo_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12 }} onClick={e => e.stopPropagation()}>📄 Ver PDF</a>}
                        </div>
                      </div>
                      <button onClick={() => update({ _ignorar: !item._ignorar })}
                        style={{ background: item._ignorar ? '#27272a' : '#7f1d1d', border:'1px solid #3f3f46', color: item._ignorar ? '#71717a' : '#f87171', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', flexShrink:0 }}>
                        {item._ignorar ? 'Restaurar' : '✕ Quitar'}
                      </button>
                    </div>
                    {!item._ignorar && (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Nombre (alias)</label>
                            <input value={item._nombre} onChange={e => update({ _nombre: e.target.value })} placeholder={item.nombre_entidad}
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Nombre empresa</label>
                            <input value={item._nombre_empresa} onChange={e => update({ _nombre_empresa: e.target.value })}
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>NIF / CIF / VAT</label>
                            <input value={item._nif_cif||''} onChange={e => update({ _nif_cif: e.target.value })} placeholder="—"
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Email</label>
                            <input value={item._email||''} onChange={e => update({ _email: e.target.value })} placeholder="—"
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Dirección</label>
                          <input value={item._direccion||''} onChange={e => update({ _direccion: e.target.value })} placeholder="—"
                            style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                        </div>
                        <div>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Tipo de contacto</label>
                          <div style={{ display:'flex', gap:8 }}>
                            {[['proveedor','Proveedor'],['equipo','Freelance'],['cliente','Cliente']].map(([rol, label]) => {
                              const active = (item._roles||['proveedor']).includes(rol);
                              return (
                                <button key={rol} onClick={() => {
                                  const cur = item._roles||['proveedor'];
                                  update({ _roles: active && cur.length > 1 ? cur.filter(r=>r!==rol) : active ? cur : [...cur, rol] });
                                }} style={{ background: active ? '#0067FD' : '#27272a', border:`1px solid ${active ? '#0067FD' : '#3f3f46'}`, color: active ? 'white' : '#71717a', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer' }}>
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Asignar a existente */}
                        <div style={{ position:'relative' }}>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Asignar a contacto existente (opcional)</label>
                          {item._asignarA ? (
                            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, padding:'6px 10px' }}>
                              <span style={{ flex:1, color:'#f4f4f5', fontSize:13 }}>{item._asignarA.nombre}</span>
                              <button onClick={() => update({ _asignarA: null, _busqueda: '' })} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:12 }}>✕</button>
                            </div>
                          ) : (
                            <>
                              <input value={item._busqueda || ''} onChange={e => update({ _busqueda: e.target.value })} placeholder="Buscar contacto..."
                                style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                              {contactosFiltrados.length > 0 && (
                                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, zIndex:10, maxHeight:160, overflowY:'auto', marginTop:2 }}>
                                  {contactosFiltrados.slice(0,8).map(c => (
                                    <div key={c.id} onClick={() => update({ _asignarA: c, _busqueda: '' })}
                                      style={{ padding:'8px 12px', cursor:'pointer', borderBottom:'1px solid #3f3f46', color:'#f4f4f5', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                                      <span style={{ flex:1 }}>{c.nombre}</span>
                                      <span style={{ color:'#52525b', fontSize:11 }}>{(c.roles||[]).join(', ')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ padding:'14px 22px', borderTop:'1px solid #27272a', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setModalNuevosContactos(null)}
                style={{ background:'none', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button disabled={confirmandoContactos} onClick={async () => {
                setConfirmandoContactos(true);
                try {
                  const token = await getToken();
                  const items = modalNuevosContactos.map(item => ({
                    accion:        item._ignorar ? 'ignorar' : item._asignarA ? 'asignar' : 'crear',
                    factura_ids:   item.factura_ids,
                    nombre:        item._nombre || item.nombre_entidad,
                    nombre_empresa: item._nombre_empresa || null,
                    nif_cif:       item._nif_cif   || item.nif_cif   || null,
                    direccion:     item._direccion || item.direccion  || null,
                    email:         item._email     || item.email      || null,
                    roles:         item._roles     || ['proveedor'],
                    contacto_id:   item._asignarA?.id || null,
                    nombre_entidad: item.nombre_entidad,
                    tipo:          item.tipo || 'gasto',
                  }));
                  const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/confirmar-contactos`, {
                    method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
                    body: JSON.stringify({ items }),
                  });
                  if (!r.ok) throw new Error('Error al confirmar');
                  setModalNuevosContactos(null);
                  qc.invalidateQueries({ queryKey: contactoKeys.all });
                  qc.invalidateQueries({ queryKey: facturaKeys.lists() });
                } catch(e) { alert(e.message); }
                finally { setConfirmandoContactos(false); }
              }}
                style={{ background:'#0067FD', border:'none', color:'white', borderRadius:8, padding:'8px 22px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: confirmandoContactos ? 0.6 : 1 }}>
                {confirmandoContactos ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
  );
}
