import { useState, useCallback, useEffect, useRef } from 'react';
import { FIELDS } from './CopywritingContext';

const LS_KEY = 'copywriting_values';
const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, '']));

function loadFromStorage() {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(LS_KEY)) }; } catch { return EMPTY; }
}

export default function Copywriting() {
  const [values, setValues] = useState(loadFromStorage);
  const refs = useRef({});

  const handleChange = useCallback((key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
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

  const handleClear = useCallback(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(EMPTY));
    setValues(EMPTY);
  }, []);

  // Sync changes made in the popup window
  useEffect(() => {
    function onStorage(e) {
      if (e.key === LS_KEY && e.newValue) {
        try { setValues({ ...EMPTY, ...JSON.parse(e.newValue) }); } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
              ref={el => refs.current[f.key] = el}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
              rows={3}
              value={values[f.key]}
              onChange={e => handleChange(f.key, e.target.value)}
              onKeyDown={e => handleKeyDown(e, f.key)}
              placeholder={`${f.label}...`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleClear}
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
