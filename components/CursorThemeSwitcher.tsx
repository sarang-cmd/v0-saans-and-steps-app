'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CursorManager, type CursorTheme } from '@/lib/cursor';

const CURSOR_THEMES: Array<{ id: CursorTheme; label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'glow', label: 'Glow' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'dot', label: 'Dot' },
];

let cursorManager: CursorManager | null = null;

export function CursorThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<CursorTheme>('default');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    // Initialize cursor manager on mount
    if (!cursorManager) {
      cursorManager = new CursorManager(currentTheme);
      cursorManager.initialize();
    }

    return () => {
      // Cleanup on unmount
      if (cursorManager) {
        cursorManager.destroy();
        cursorManager = null;
      }
    };
  }, []);

  const handleThemeChange = (theme: CursorTheme) => {
    setCurrentTheme(theme);
    if (cursorManager) {
      cursorManager.setTheme(theme);
    }
    // Save preference
    localStorage.setItem('cursor-theme', theme);
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
      {showSelector && (
        <div className="absolute bottom-12 md:bottom-auto md:top-12 right-0 flex flex-col gap-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl">
          {CURSOR_THEMES.map((theme) => (
            <Button
              key={theme.id}
              size="sm"
              variant={currentTheme === theme.id ? 'default' : 'ghost'}
              onClick={() => handleThemeChange(theme.id)}
              className="w-24"
            >
              {theme.label}
            </Button>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowSelector(!showSelector)}
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Cursor theme"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 18h18v-8H3v8z" />
          <path d="M12 2l-6 6h4v8h4V8h4l-6-6z" />
        </svg>
      </Button>
    </div>
  );
}
