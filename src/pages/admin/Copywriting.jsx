import { useState, useEffect, useCallback } from 'react';

const FIELDS = [
  { key: 'historia',   label: 'Historia' },
  { key: 'promocion',  label: 'Promoción' },
  { key: 'informacion',label: 'Información' },
  { key: 'problema',   label: 'Problema' },
  { key: 'sentimiento',label: 'Sentimiento' },
  { key: 'notas',      label: 'Notas' },
];

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, '']));

function CopyFields({ values, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(f => (
        <div key={f.key}>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
            {f.label}
          </label>
          <textarea
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
            rows={3}
            value={values[f.key]}
            onChange={e => onChange(f.key, e.target.value)}
            placeholder={`${f.label}...`}
          />
        </div>
      ))}
    </div>
  );
}

function FloatingPanel({ values, onChange, onClear, onHide }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <span className="text-white text-sm font-semibold">Copywriting</span>
        <button
          onClick={onHide}
          className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          Ocultar
        </button>
      </div>
      <div className="px-4 py-3 overflow-y-auto max-h-[70vh]">
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
                onChange={e => onChange(f.key, e.target.value)}
                placeholder={`${f.label}...`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-zinc-700">
        <button
          onClick={onClear}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default function Copywriting() {
  const [values, setValues] = useState(EMPTY);
  const [floating, setFloating] = useState(false);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleClear = useCallback(() => setValues(EMPTY), []);

  // Cmd+Shift+C / Ctrl+Shift+C para toggle del panel flotante
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setFloating(prev => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-white text-2xl font-semibold mb-6">Copywriting</h1>

      <CopyFields values={values} onChange={handleChange} />

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleClear}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={() => setFloating(true)}
          className="bg-white hover:bg-zinc-200 text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Flotar
        </button>
      </div>

      {floating && (
        <FloatingPanel
          values={values}
          onChange={handleChange}
          onClear={handleClear}
          onHide={() => setFloating(false)}
        />
      )}
    </div>
  );
}
