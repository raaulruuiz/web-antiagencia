import { useState, useCallback, useEffect, useRef } from 'react';
import { STRUCTURES, LS_DEFAULT } from './CopywritingContext';

function getDefaultId() {
  return parseInt(localStorage.getItem(LS_DEFAULT) || '1', 10);
}

function emptyFor(s) {
  return Object.fromEntries(s.fields.map(f => [f.key, '']));
}

function loadValues(s) {
  const empty = emptyFor(s);
  try { return { ...empty, ...JSON.parse(localStorage.getItem(s.lsKey)) }; } catch { return empty; }
}

function autoResize(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

export default function CopywritingPopup() {
  const [activeId, setActiveId] = useState(getDefaultId);
  const [valuesMap, setValuesMap] = useState(() =>
    Object.fromEntries(STRUCTURES.map(s => [s.id, loadValues(s)]))
  );
  const refs = useRef({});

  const active = STRUCTURES.find(s => s.id === activeId);
  const values = valuesMap[activeId];

  const handleChange = useCallback((key, val) => {
    setValuesMap(prev => {
      const next = { ...prev, [activeId]: { ...prev[activeId], [key]: val } };
      localStorage.setItem(active.lsKey, JSON.stringify(next[activeId]));
      return next;
    });
  }, [activeId, active]);

  const handleClear = useCallback(() => {
    const empty = emptyFor(active);
    localStorage.setItem(active.lsKey, JSON.stringify(empty));
    setValuesMap(prev => ({ ...prev, [activeId]: empty }));
    setTimeout(() => Object.values(refs.current).forEach(autoResize), 0);
  }, [activeId, active]);

  useEffect(() => {
    Object.values(refs.current).forEach(autoResize);
  }, [values, activeId]);

  // Sync from page
  useEffect(() => {
    function onStorage(e) {
      STRUCTURES.forEach(s => {
        if (e.key === s.lsKey && e.newValue) {
          try {
            setValuesMap(prev => ({ ...prev, [s.id]: { ...emptyFor(s), ...JSON.parse(e.newValue) } }));
          } catch {}
        }
      });
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleKeyDown = useCallback((e, key) => {
    const lastKey = active.fields[active.fields.length - 1].key;
    if (key === lastKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const keys = active.fields.map(f => f.key);
      const nextKey = keys[keys.indexOf(key) + 1];
      if (nextKey && refs.current[nextKey]) refs.current[nextKey].focus();
    }
  }, [activeId, active]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-white text-sm font-semibold">Copywriting</span>
        <button
          onClick={() => window.close()}
          className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          Ocultar
        </button>
      </div>

      {/* Structure tabs */}
      <div className="flex gap-1 px-3 pt-2 pb-1">
        {STRUCTURES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
              s.id === activeId
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-2">
          {active.fields.map(f => (
            <div key={f.key}>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {f.label}
              </label>
              <textarea
                ref={el => refs.current[f.key] = el}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs resize-y focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                rows={2}
                value={values[f.key] || ''}
                onChange={e => { handleChange(f.key, e.target.value); autoResize(e.target); }}
                onKeyDown={e => handleKeyDown(e, f.key)}
                placeholder={`${f.label}...`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-zinc-800">
        <button
          onClick={handleClear}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
