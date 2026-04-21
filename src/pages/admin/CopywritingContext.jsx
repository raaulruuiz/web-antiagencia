import { createContext, useContext, useEffect } from 'react';

export const FIELDS = [
  { key: 'historia',    label: 'Historia' },
  { key: 'promocion',   label: 'Promoción' },
  { key: 'informacion', label: 'Información' },
  { key: 'problema',    label: 'Problema' },
  { key: 'sentimiento', label: 'Sentimiento' },
  { key: 'notas',       label: 'Notas' },
];

const CopyCtx = createContext(null);
export const useCopywriting = () => useContext(CopyCtx);

export function CopywritingProvider({ children }) {
  // Cmd+Shift+C / Ctrl+Shift+C abre la ventana popup
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const w = 380, h = 620;
        const left = window.screen.width - w - 20;
        const top = window.screen.height - h - 60;
        window.open('/admin/copywriting-popup', 'copywriting', `width=${w},height=${h},left=${left},top=${top},resizable=yes`);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <CopyCtx.Provider value={{}}>{children}</CopyCtx.Provider>;
}
