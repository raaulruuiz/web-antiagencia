import { SearchableSelect } from './SearchableSelect';
import { MultiCheckboxDropdown } from './MultiCheckboxDropdown';
import { CAMPOS_FILTRO, OPS_POR_TIPO } from '../constants';

export function PanelFiltros({ filtros, op, onChangeFiltros, onChangeOp, listasAsignacion = {}, campos = CAMPOS_FILTRO }) {
  const defaultValor = meta => (meta?.tipo === 'select' || meta?.tipo === 'array') ? [] : '';

  function addCondicion() {
    const meta = campos[0];
    onChangeFiltros([...filtros, { id: Date.now(), campo: meta.key, operador: (OPS_POR_TIPO[meta.tipo] || [])[0]?.[0] || 'ilike', valor: defaultValor(meta) }]);
  }
  function updateCondicion(id, key, val) {
    onChangeFiltros(filtros.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [key]: val };
      if (key === 'campo') {
        const meta = campos.find(c => c.key === val);
        updated.operador = (OPS_POR_TIPO[meta?.tipo || 'text'] || [])[0]?.[0] || 'eq';
        updated.valor = defaultValor(meta);
      }
      return updated;
    }));
  }
  function removeCondicion(id) { onChangeFiltros(filtros.filter(f => f.id !== id)); }

  const panelStyle = { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 10, padding: '14px 16px', marginBottom: 12 };
  const btnLink = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 };

  return (
    <div style={panelStyle}>
      {filtros.length > 1 && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={op} onChange={e => onChangeOp(e.target.value)}
            style={{ background: '#161616', border: '1px solid #0067FD', borderRadius: 6, color: '#0067FD', padding: '3px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <option value="and">Y (AND)</option>
            <option value="or">O (OR)</option>
          </select>
          <span style={{ color: '#52525b', fontSize: 12 }}>
            {op === 'and' ? 'se deben cumplir todas las condiciones' : 'se debe cumplir al menos una condición'}
          </span>
        </div>
      )}
      {filtros.length === 0 && (
        <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 10px 0' }}>Sin filtros activos — añade una condición</p>
      )}
      {filtros.map((f, idx) => {
        const meta = campos.find(c => c.key === f.campo) || campos[0];
        const ops  = OPS_POR_TIPO[meta.tipo] || OPS_POR_TIPO.text;
        const sinValor = ['is_null', 'is_not_null'].includes(f.operador);
        const isMulti = meta.tipo === 'select' || meta.tipo === 'array';
        const isUuid  = meta.tipo === 'uuid_nullable';
        const uuidOpciones = isUuid ? (listasAsignacion[meta.key] || []) : [];
        return (
          <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            {idx > 0 && (
              <span style={{ color: '#0067FD', fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                {op === 'and' ? 'Y' : 'O'}
              </span>
            )}
            <select value={f.campo} onChange={e => updateCondicion(f.id, 'campo', e.target.value)}
              style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 130 }}>
              {campos.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select value={f.operador} onChange={e => updateCondicion(f.id, 'operador', e.target.value)}
              style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 118 }}>
              {ops.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            {!sinValor && (
              isMulti ? (
                <MultiCheckboxDropdown
                  opciones={meta.ops || []}
                  valores={Array.isArray(f.valor) ? f.valor : []}
                  onChange={v => updateCondicion(f.id, 'valor', v)}
                />
              ) : isUuid && uuidOpciones.length > 0 ? (
                <SearchableSelect
                  value={f.valor || ''}
                  onChange={v => updateCondicion(f.id, 'valor', v)}
                  options={uuidOpciones}
                  placeholder="— Elige —"
                  style={{ minWidth: 180 }}
                />
              ) : (
                <input
                  type={meta.tipo === 'date' ? 'date' : (meta.tipo === 'number' || meta.tipo === 'number_nullable') ? 'number' : 'text'}
                  value={f.valor}
                  onChange={e => updateCondicion(f.id, 'valor', e.target.value)}
                  placeholder="Valor"
                  style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, width: 130, colorScheme: 'dark' }}
                />
              )
            )}
            <button onClick={() => removeCondicion(f.id)}
              style={{ ...btnLink, color: '#52525b', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        );
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: filtros.length > 0 ? 10 : 0 }}>
        <button onClick={addCondicion} style={{ ...btnLink, color: '#0067FD' }}>+ Añadir condición</button>
        {filtros.length > 0 && (
          <button onClick={() => onChangeFiltros([])} style={{ ...btnLink, color: '#52525b', fontSize: 12 }}>Limpiar todo</button>
        )}
      </div>
    </div>
  );
}
