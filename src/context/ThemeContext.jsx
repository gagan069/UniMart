import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const t = new URLSearchParams(window.location.search).get('theme');
        if (t === 'dark' || t === 'light') return t;
      }
    } catch (e) {}

    try {
      const savedTheme = localStorage.getItem('unimart-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (e) {
      // In private browsing or sandboxed iframes, localStorage may throw
    }

    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}

    try {
      localStorage.setItem('unimart-theme', theme);
    } catch (e) {
      // Ignore storage access errors in private/incognito windows
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

export default ThemeContext;
