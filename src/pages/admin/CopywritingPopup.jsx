import { useState, useCallback, useRef } from 'react';

const FIELDS = [
  { key: 'historia',    label: 'Historia' },
  { key: 'promocion',   label: 'Promoción' },
  { key: 'informacion', label: 'Información' },
  { key: 'problema',    label: 'Problema' },
  { key: 'sentimiento', label: 'Sentimiento' },
  { key: 'notas',       label: 'Notas' },
];

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, '']));

export default function CopywritingPopup() {
  const [values, setValues] = useState(EMPTY);
  const refs = useRef({});

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleKeyDown = useCallback((e, key) => {
    if (key === 'notas') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const keys = FIELDS.map(f => f.key);
      const nextKey = keys[keys.indexOf(key) + 1];
      if (nextKey && refs.current[nextKey]) refs.current[nextKey].focus();
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-zinc-800 gap-1">
        <span className="text-white text-sm font-semibold">Copywriting</span>
        <button
          onClick={() => window.close()}
          className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          Ocultar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-2">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {f.label}
              </label>
              <textarea
                ref={el => refs.current[f.key] = el}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs resize-none focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                rows={2}
                value={values[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                onKeyDown={e => handleKeyDown(e, f.key)}
                placeholder={`${f.label}...`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-zinc-800">
        <button
          onClick={() => setValues(EMPTY)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
