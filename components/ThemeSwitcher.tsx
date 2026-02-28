'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'auto' as const, label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-9 h-9 p-0"
        title={`Current theme: ${theme}`}
      >
        {theme === 'light' && <Sun className="w-4 h-4" />}
        {theme === 'dark' && <Moon className="w-4 h-4" />}
        {theme === 'auto' && <Monitor className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-50 glass">
          <p className="text-xs font-semibold text-foreground/70 px-2 py-1">Select Theme</p>
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTheme(id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                theme === id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-foreground/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
