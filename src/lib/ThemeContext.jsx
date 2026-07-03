import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('aa-biblioteca-theme') || 'dark');
  const toggle = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    localStorage.setItem('aa-biblioteca-theme', next);
    return next;
  });
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
