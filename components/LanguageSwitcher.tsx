'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useSettings();

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {(['en', 'hi'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            language === lang
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-foreground/70 hover:text-foreground'
          }`}
        >
          {lang === 'en' ? 'English' : 'हिंदी'}
        </button>
      ))}
    </div>
  );
}
