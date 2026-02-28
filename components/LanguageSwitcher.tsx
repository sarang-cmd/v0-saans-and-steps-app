'use client';

import React, { useState, useEffect } from 'react';
import { i18n, type Language } from '@/lib/i18n';

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    setLanguage(i18n.getLanguage());
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.setLanguage(lang);
    setLanguage(lang);
    // Trigger re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  };

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {(['en', 'hi'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
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
