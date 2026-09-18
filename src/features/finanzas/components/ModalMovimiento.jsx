import { fmt } from '../utils';

// ── Fila de movimiento ──────────────────────────────────────────

export function ModalMovimiento({ m, isLoading, isError, onClose, onEditar, onEliminar, onConfirm, onAbrirFactura, zIndex = 1000 }) {
  const _overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
  const _panel   = { background: '#161616', border: '1px solid #3f3f46', borderRadius: 14, width: '100%', maxWidth: 520 };

  if (isLoading) return (
    <div onClick={onClose} style={_overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ..._panel, padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
        <span style={{ color: '#71717a', fontSize: 14 }}>Cargando…</span>
      </div>
    </div>
  );

  if (isError || !m) return (
    <div onClick={onClose} style={_overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ..._panel, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <span style={{ color: '#f87171', fontSize: 14 }}>Error al cargar el movimiento</span>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#71717a', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Cerrar</button>
      </div>
    </div>
  );

  const esIngreso = m.tipo === 'Ingreso';
  const color = esIngreso ? '#22c55e' : '#f87171';

  const Field = ({ label, value, mono }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color: (value == null || value === '' || value === '—') ? '#3f3f46' : mono ? '#a78bfa' : 'white', fontSize: 13, fontFamily: mono ? 'monospace' : 'inherit' }}>
        {(value == null || value === '') ? '—' : value}
      </span>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 24, position: 'relative' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <span style={{ color, fontSize: 22, flexShrink: 0, marginTop: 2 }}>{esIngreso ? '↑' : '↓'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{m.nombre}</p>
            <p style={{ color: '#71717a', fontSize: 13, margin: 0 }}>{m.fecha} · {m.cuenta}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
            {onEditar && (
              <button
                onClick={() => { onClose(); onEditar(m); }}
                style={{ background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#71717a', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
              >Editar</button>
            )}
            {onEliminar && (
              <button
                onClick={() => { onClose(); onConfirm({ texto: `¿Eliminar "${m.nombre}"?`, onOk: () => onEliminar(m.id) }); }}
                style={{ background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#f87171', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
              >Eliminar</button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#52525b', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}
            >×</button>
          </div>
        </div>

        {/* Importe principal — estructura fija siempre igual */}
        <div style={{ background: '#0d0d0d', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Importe</p>
            <p style={{ color, fontSize: 22, fontWeight: 700, margin: 0 }}>{esIngreso ? '+' : '-'}{fmt(m.cantidad)}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Base Imponible</p>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(m.base_imponible)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Beneficio</p>
            <p style={{ color: m.beneficio >= 0 ? '#22c55e' : '#f87171', fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(m.beneficio)}</p>
          </div>
        </div>

        {/* Campos en grid — estructura fija, siempre los mismos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
          <Field label="Tipo"            value={m.tipo} />
          <Field label="Cuenta"          value={m.cuenta} />
          <Field label="IVA"             value={m.iva} />
          <Field label="IVA a pagar"     value={fmt(m.iva_a_pagar)} />
          <Field label="IRPF"            value={m.irpf} />
          <Field label="IRPF a pagar"    value={fmt(m.irpf_a_pagar)} />
          <Field label="IRPF retenido (yo)" value={fmt(m.irpf_retenido_yo)} />
          <Field label="Importe s/ factura" value={fmt(m.importe_factura)} />
          <Field label="Fecha Factura"   value={m.fecha_factura || '—'} />
          <Field label="Clientes" value={(m.clientes_info || []).length ? m.clientes_info.map(c => c.nombre).join(', ') : null} />
          <Field label="Equipo" value={(m.equipo_info || []).length ? m.equipo_info.map(e => e.nombre).join(', ') : null} />
          {/* Documentos vinculados — en la segunda columna, a la altura de Equipo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documentos vinculados</span>
            {(m.facturas_info?.length || 0) > 0
              ? <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{m.facturas_info.map(f => (
                  <button key={f.id} onClick={() => onAbrirFactura && onAbrirFactura(f.id)}
                    style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'#60a5fa', borderRadius:5, padding:'2px 8px', fontSize:11, cursor: onAbrirFactura ? 'pointer' : 'default', fontFamily:'inherit' }}>
                    📄 {f.nombre}
                  </button>
                ))}</div>
              : <span style={{ color:'#3f3f46', fontSize:12 }}>—</span>
            }
          </div>
        </div>

        {/* Reparto — solo si hay múltiples clientes o equipo */}
        {((m.clientes_info?.length > 1) || (m.equipo_info?.length > 1)) && (() => {
          const porCliente = m.clientes_info?.length > 1 ? Math.round(m.cantidad / m.clientes_info.length * 100) / 100 : null;
          const porMiembro = m.equipo_info?.length > 1 ? Math.round(m.cantidad / m.equipo_info.length * 100) / 100 : null;
          return (
            <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Reparto</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {porCliente != null && m.clientes_info.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a1a1aa' }}>{c.nombre}</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{fmt(porCliente)}</span>
                  </div>
                ))}
                {porMiembro != null && m.equipo_info.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a1a1aa' }}>{e.nombre}</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{fmt(porMiembro)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20, display: 'none' }}>
        </div>

        {/* Categorías */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Categorías</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(m.categorias || []).length > 0
              ? m.categorias.map(c => <span key={c} style={{ background: '#27272a', color: '#a1a1aa', fontSize: 12, padding: '3px 9px', borderRadius: 6 }}>{c}</span>)
              : <span style={{ color: '#52525b', fontSize: 13 }}>—</span>
            }
          </div>
        </div>

        {/* Metadatos — zona dim */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>ID</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>{m.id || '—'}</span>
          </div>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Creado</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>
              {m.created_at ? m.created_at.slice(0, 10) : '—'}
            </span>
          </div>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Modificado</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>
              {m.updated_at ? m.updated_at.slice(0, 10) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
