'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🌐' },
    { code: 'hi' as const, name: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-9 h-9 p-0"
        title={`Current language: ${language}`}
      >
        <Globe className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg p-2 z-50 glass">
          <p className="text-xs font-semibold text-foreground/70 px-2 py-1">Select Language</p>
          {languages.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => {
                setLanguage(code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                language === code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-foreground/10'
              }`}
            >
              <span>{flag}</span>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
