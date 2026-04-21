import { useState, useCallback } from 'react';

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

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-white text-sm font-semibold">Copywriting</span>
        <button
          onClick={() => setValues(EMPTY)}
          className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          Limpiar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {f.label}
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs resize-none focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                rows={2}
                value={values[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={`${f.label}...`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
