'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useSettings();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground/70 hover:text-foreground'
        }`}
        title="Light mode"
      >
        <span>☀️</span> Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground/70 hover:text-foreground'
        }`}
        title="Dark mode"
      >
        <span>🌙</span> Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground/70 hover:text-foreground'
        }`}
        title="System default"
      >
        <span>🖥️</span> System
      </button>
    </div>
  );
}
