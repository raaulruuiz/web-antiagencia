import { CAMPOS_SORT } from '../constants';

export function PanelOrdenar({ sorts, onChange, campos = CAMPOS_SORT }) {
  const usados = new Set(sorts.map(s => s.campo));
  function addSort() {
    const libre = campos.find(c => !usados.has(c.key));
    if (libre) onChange([...sorts, { campo: libre.key, dir: 'desc' }]);
  }
  function updateSort(idx, key, val) { onChange(sorts.map((s, i) => i === idx ? { ...s, [key]: val } : s)); }
  function removeSort(idx) { onChange(sorts.filter((_, i) => i !== idx)); }

  const panelStyle = { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 10, padding: '14px 16px', marginBottom: 12 };
  const btnLink = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 };

  return (
    <div style={panelStyle}>
      {sorts.length === 0 && (
        <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 10px 0' }}>Sin ordenación — por defecto fecha más reciente</p>
      )}
      {sorts.map((s, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <select value={s.campo} onChange={e => updateSort(idx, 'campo', e.target.value)}
            style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 140 }}>
            {campos.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select value={s.dir} onChange={e => updateSort(idx, 'dir', e.target.value)}
            style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 130 }}>
            <option value="desc">Descendente ↓</option>
            <option value="asc">Ascendente ↑</option>
          </select>
          <button onClick={() => removeSort(idx)}
            style={{ ...btnLink, color: '#52525b', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: sorts.length > 0 ? 10 : 0 }}>
        <button onClick={addSort} disabled={sorts.length >= campos.length}
          style={{ ...btnLink, color: sorts.length >= campos.length ? '#3f3f46' : '#8b5cf6' }}>
          + Añadir ordenación
        </button>
        {sorts.length > 0 && (
          <button onClick={() => onChange([])} style={{ ...btnLink, color: '#52525b', fontSize: 12 }}>Restablecer</button>
        )}
      </div>
    </div>
  );
}
