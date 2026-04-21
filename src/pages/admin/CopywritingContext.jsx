import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FIELDS = [
  { key: 'historia',    label: 'Historia' },
  { key: 'promocion',   label: 'Promoción' },
  { key: 'informacion', label: 'Información' },
  { key: 'problema',    label: 'Problema' },
  { key: 'sentimiento', label: 'Sentimiento' },
  { key: 'notas',       label: 'Notas' },
];
export { FIELDS };

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, '']));

const CopyCtx = createContext(null);
export const useCopywriting = () => useContext(CopyCtx);

export function CopywritingProvider({ children }) {
  const [values, setValues] = useState(EMPTY);
  const [floating, setFloating] = useState(false);

  const handleChange = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleClear = useCallback(() => setValues(EMPTY), []);

  // Cmd+Shift+C / Ctrl+Shift+C toggle
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
    <CopyCtx.Provider value={{ values, floating, setFloating, handleChange, handleClear }}>
      {children}
    </CopyCtx.Provider>
  );
}
