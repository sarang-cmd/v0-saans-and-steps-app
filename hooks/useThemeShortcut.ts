'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemeShortcut() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D for dark mode toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (theme === 'dark') {
          setTheme('light');
        } else if (theme === 'light') {
          setTheme('dark');
        } else {
          setTheme('dark');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [theme, setTheme]);
}
