import { useState, useCallback } from 'react';
import { FIELDS } from './CopywritingContext';

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, '']));

export default function Copywriting() {
  const [values, setValues] = useState(EMPTY);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-white text-2xl font-semibold mb-1">Copywriting</h1>
      <p className="text-zinc-500 text-xs mb-6">
        Abre el panel flotante con <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-xs font-mono">⌘ Shift C</kbd> o <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl Shift C</kbd>
      </p>

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
              onChange={e => handleChange(f.key, e.target.value)}
              placeholder={`${f.label}...`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setValues(EMPTY)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={() => {
            const w = 140, h = window.screen.height;
            const left = window.screen.width - w;
            window.open('/admin/copywriting-popup', 'copywriting', `width=${w},height=${h},left=${left},top=0,resizable=yes`);
          }}
          className="bg-white hover:bg-zinc-200 text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Flotar
        </button>
      </div>
    </div>
  );
}
