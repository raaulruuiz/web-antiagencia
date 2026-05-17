import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { STRUCTURES, LS_ORDER, loadOrder, saveOrder } from './CopywritingContext';

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

// ── Práctica ──
const LS_PRACTICA      = 'copywriting_practica';
const LS_PRACTICA_USED = 'copywriting_practica_used';

const PRACTICA_COLS = [
  { key: 'asunto',       label: 'Asunto' },
  { key: 'tematica',     label: 'Temática' },
  { key: 'tecnica',      label: 'Técnica de escritura' },
  { key: 'personalidad', label: 'Personalidad' },
  { key: 'publico',      label: 'Público objetivo' },
];
const PRACTICA_EMPTY = Object.fromEntries(PRACTICA_COLS.map(c => [c.key, '']));

function loadPractica() {
  try { return { ...PRACTICA_EMPTY, ...JSON.parse(localStorage.getItem(LS_PRACTICA)) }; } catch { return PRACTICA_EMPTY; }
}

function loadUsed() {
  try { return JSON.parse(localStorage.getItem(LS_PRACTICA_USED)) || []; } catch { return []; }
}

function parseItems(text) {
  return text.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
}

function pickRandom(arr) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Copywriting() {
  const [order, setOrder] = useState(loadOrder);
  const [activeId, setActiveId] = useState(() => loadOrder()[0]);
  const [valuesMap, setValuesMap] = useState(() =>
    Object.fromEntries(STRUCTURES.map(s => [s.id, loadValues(s)]))
  );
  const refs = useRef({});

  // Práctica state
  const [practica, setPractica] = useState(loadPractica);
  const [usedCombos, setUsedCombos] = useState(loadUsed);
  const [reto, setReto] = useState(null);

  const active = STRUCTURES.find(s => s.id === activeId);
  const values = valuesMap[activeId];

  // ── Derived práctica stats ──
  const currentItems = useMemo(() =>
    Object.fromEntries(PRACTICA_COLS.map(col => [col.key, new Set(parseItems(practica[col.key]))])),
    [practica]
  );

  const totalCombinations = useMemo(() => {
    const counts = PRACTICA_COLS.map(col => currentItems[col.key].size);
    if (counts.some(c => c === 0)) return 0;
    return counts.reduce((acc, c) => acc * c, 1);
  }, [currentItems]);

  // Valid used = combos where all values still exist in their column
  const validUsedCount = useMemo(() =>
    usedCombos.filter(combo =>
      PRACTICA_COLS.every(col => currentItems[col.key].has(combo[col.key]))
    ).length,
    [usedCombos, currentItems]
  );

  const remaining = totalCombinations - validUsedCount;

  // ── Handlers ──
  const handleChange = useCallback((key, val) => {
    setValuesMap(prev => {
      const next = { ...prev, [activeId]: { ...prev[activeId], [key]: val } };
      localStorage.setItem(active.lsKey, JSON.stringify(next[activeId]));
      return next;
    });
  }, [activeId, active]);

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

  const handleClear = useCallback(() => {
    const empty = emptyFor(active);
    localStorage.setItem(active.lsKey, JSON.stringify(empty));
    setValuesMap(prev => ({ ...prev, [activeId]: empty }));
    setTimeout(() => Object.values(refs.current).forEach(autoResize), 0);
  }, [activeId, active]);

  const handleSetDefault = useCallback(() => {
    const newOrder = [activeId, ...order.filter(id => id !== activeId)];
    saveOrder(newOrder);
    setOrder(newOrder);
  }, [activeId, order]);

  const handlePracticaChange = useCallback((key, val) => {
    setPractica(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem(LS_PRACTICA, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleGenerarReto = useCallback(() => {
    if (remaining <= 0) return;

    const items = Object.fromEntries(PRACTICA_COLS.map(col => [col.key, parseItems(practica[col.key])]));
    const usedSet = new Set(usedCombos.map(c => JSON.stringify(c)));

    let combo;
    let attempts = 0;
    do {
      combo = Object.fromEntries(PRACTICA_COLS.map(col => [col.key, pickRandom(items[col.key])]));
      attempts++;
      if (attempts > 10000) return;
    } while (usedSet.has(JSON.stringify(combo)));

    const newUsed = [...usedCombos, combo];
    localStorage.setItem(LS_PRACTICA_USED, JSON.stringify(newUsed));
    setUsedCombos(newUsed);
    setReto(combo);
  }, [practica, usedCombos, remaining]);

  const handleResetUsed = useCallback(() => {
    localStorage.removeItem(LS_PRACTICA_USED);
    setUsedCombos([]);
  }, []);

  useEffect(() => {
    Object.values(refs.current).forEach(autoResize);
  }, [values, activeId]);

  // Sync from popup
  useEffect(() => {
    function onStorage(e) {
      STRUCTURES.forEach(s => {
        if (e.key === s.lsKey && e.newValue) {
          try {
            setValuesMap(prev => ({ ...prev, [s.id]: { ...emptyFor(s), ...JSON.parse(e.newValue) } }));
          } catch {}
        }
      });
      if (e.key === LS_ORDER && e.newValue) {
        try { setOrder(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isDefault = order[0] === activeId;
  const exhausted = totalCombinations > 0 && remaining <= 0;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl">
        <h1 className="text-white text-2xl font-semibold mb-1">Copywriting</h1>
        <p className="text-zinc-500 text-xs mb-6">
          Abre el panel flotante con <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-xs font-mono">⌘ Shift C</kbd> o <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl Shift C</kbd>
        </p>

        {/* Structure tabs */}
        <div className="flex items-center gap-2 mb-6">
          {order.map((id, idx) => (
            <button
              key={id}
              onClick={() => setActiveId(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                id === activeId
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Estructura {idx + 1}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {active.fields.map(f => (
            <div key={f.key}>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {f.label}
              </label>
              <textarea
                ref={el => refs.current[f.key] = el}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-y focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                rows={3}
                value={values[f.key] || ''}
                onChange={e => { handleChange(f.key, e.target.value); autoResize(e.target); }}
                onKeyDown={e => handleKeyDown(e, f.key)}
                placeholder={`${f.label}...`}
              />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 mt-5 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={handleSetDefault}
            disabled={isDefault}
            className="accent-white w-3.5 h-3.5"
          />
          <span className="text-zinc-400 text-xs">Marcar como predeterminada</span>
        </label>

        <div className="flex gap-3 mt-5">
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

      {/* ── Práctica ── */}
      <div className="mt-12 max-w-6xl">
        <h2 className="text-white text-lg font-semibold mb-1">Práctica</h2>
        <p className="text-zinc-500 text-xs mb-5">Separa los items con saltos de línea o comas. El generador elige uno al azar de cada columna.</p>

        <div className="grid grid-cols-5 gap-3 mb-5">
          {PRACTICA_COLS.map(col => (
            <div key={col.key}>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {col.label}
              </label>
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-y focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                rows={8}
                value={practica[col.key]}
                onChange={e => handlePracticaChange(col.key, e.target.value)}
                placeholder={`${col.label}...`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <button
            onClick={handleGenerarReto}
            disabled={exhausted}
            className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-colors ${
              exhausted
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            Generar reto
          </button>
          <button
            onClick={handleResetUsed}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Reiniciar usadas
          </button>
          <div className="flex gap-3 text-xs text-zinc-500">
            <span>{totalCombinations.toLocaleString()} combinaciones posibles</span>
            <span>·</span>
            <span className={remaining <= 0 && totalCombinations > 0 ? 'text-red-400' : ''}>
              {remaining.toLocaleString()} restantes
            </span>
          </div>
        </div>

        {exhausted && (
          <p className="text-red-400 text-sm mb-4">Has completado todas las combinaciones posibles. Pulsa "Reiniciar usadas" para empezar de nuevo.</p>
        )}

        {reto && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-6 text-2xl text-white leading-relaxed text-center">
            Escribe un email con asunto{' '}
            <span style={{ color: '#4d9fff' }}>"{reto.asunto || '—'}"</span>
            , con la temática{' '}
            <span style={{ color: '#4d9fff' }}>"{reto.tematica || '—'}"</span>
            , usando la técnica de escritura{' '}
            <span style={{ color: '#4d9fff' }}>"{reto.tecnica || '—'}"</span>
            , dirigido al público de{' '}
            <span style={{ color: '#4d9fff' }}>"{reto.publico || '—'}"</span>
            {' '}y escribiendo como si fueses{' '}
            <span style={{ color: '#4d9fff' }}>"{reto.personalidad || '—'}"</span>
            .
          </div>
        )}
      </div>
    </div>
  );
}
