import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'skillforge-theme';

export function ThemeProvider({ children }) {
  // Read theme from localStorage, strictly defaulting to 'dark'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
      if (stored === 'light') return 'light';
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to DOM and localStorage
  const applyTheme = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark';

    try {
      // Remove all legacy theme classes
      document.documentElement.classList.remove('dark-mode', 'light-mode', 'dark-theme', 'light-theme');
      document.body.classList.remove('dark-mode', 'light-mode', 'dark-theme', 'light-theme');

      // Add standard theme class
      document.documentElement.classList.add(`${validTheme}-mode`);
      document.body.classList.add(`${validTheme}-mode`);
      document.documentElement.dataset.theme = validTheme;

      // Persist in localStorage
      localStorage.setItem(STORAGE_KEY, validTheme);
      localStorage.setItem('theme', validTheme);
    } catch (err) {
      console.error('Failed to apply theme:', err);
    }
  };

  // Synchronize DOM on initial render and state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(validTheme);
    applyTheme(validTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
