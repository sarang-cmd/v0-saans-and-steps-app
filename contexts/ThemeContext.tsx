'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Define applyTheme function first
  const applyTheme = React.useCallback((newTheme: Theme) => {
    if (typeof document === 'undefined') return;

    let actualTheme: 'light' | 'dark';
    
    if (newTheme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = newTheme;
    }

    setResolvedTheme(actualTheme);
    
    const html = document.documentElement;
    if (actualTheme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', newTheme);
    }
    applyTheme(newTheme);
  }, [applyTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = (localStorage.getItem('app_theme') as Theme) || 'auto';
    setThemeState(savedTheme);
    setMounted(true);
    applyTheme(savedTheme);
  }, [applyTheme]);

  // Watch for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'auto' as const,
      setTheme: () => {},
      resolvedTheme: 'light' as const,
    };
  }
  return context;
}
