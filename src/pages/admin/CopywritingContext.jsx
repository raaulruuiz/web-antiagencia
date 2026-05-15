import { createContext, useContext, useEffect } from 'react';

export const STRUCTURES = [
  {
    id: 1,
    label: 'Estructura 1',
    lsKey: 'copywriting_values',
    fields: [
      { key: 'historia',    label: 'Historia' },
      { key: 'promocion',   label: 'Promoción' },
      { key: 'informacion', label: 'Información' },
      { key: 'problema',    label: 'Problema' },
      { key: 'sentimiento', label: 'Sentimiento' },
      { key: 'notas',       label: 'Notas' },
    ],
  },
  {
    id: 2,
    label: 'Estructura 2',
    lsKey: 'copywriting_values_2',
    fields: [
      { key: 'objetivo',    label: 'Objetivo' },
      { key: 'tres_cosas',  label: '3 Cosas Importantes' },
      { key: 'yo_lo_haria', label: '¿Yo lo haría?' },
    ],
  },
];

export const LS_ORDER = 'copywriting_order';

export function loadOrder() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_ORDER));
    if (Array.isArray(stored) && stored.length === STRUCTURES.length) return stored;
  } catch {}
  return STRUCTURES.map(s => s.id);
}

export function saveOrder(order) {
  localStorage.setItem(LS_ORDER, JSON.stringify(order));
}

// Kept for backward compat
export const FIELDS = STRUCTURES[0].fields;

const CopyCtx = createContext(null);
export const useCopywriting = () => useContext(CopyCtx);

export function CopywritingProvider({ children }) {
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const w = 140, h = window.screen.height;
        const left = window.screen.width - w;
        window.open('/admin/copywriting-popup', 'copywriting', `width=${w},height=${h},left=${left},top=0,resizable=yes`);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <CopyCtx.Provider value={{}}>{children}</CopyCtx.Provider>;
}
