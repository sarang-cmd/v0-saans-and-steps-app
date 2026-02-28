'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.today': 'Today',
    'nav.planner': 'Planner',
    'nav.watch': 'Watch',
    'nav.profile': 'Profile',
    'today.title': 'Air Quality & Fitness',
    'today.subtitle': 'Find your perfect workout time',
    'planner.title': 'Weekly Planner',
    'watch.title': 'Multi-City Watch',
    'profile.title': 'Profile & Settings',
  },
  hi: {
    'nav.today': 'आज',
    'nav.planner': 'योजना',
    'nav.watch': 'निगरानी',
    'nav.profile': 'प्रोफाइल',
    'today.title': 'वायु गुणवत्ता और फिटनेस',
    'today.subtitle': 'अपने सही व्यायाम का समय खोजें',
    'planner.title': 'साप्ताहिक योजना',
    'watch.title': 'मल्टी-सिटी निगरानी',
    'profile.title': 'प्रोफाइल और सेटिंग्स',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('app_language') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    } else {
      // Try to detect from browser language
      const browserLang = navigator.language.split('-')[0];
      setLanguageState(browserLang === 'hi' ? 'hi' : 'en');
    }
    
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
      // Update HTML lang attribute
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    return translations[language]?.[key] || defaultValue || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  // Return safe defaults if provider is missing (for 404 pages, etc.)
  if (!context) {
    return {
      language: 'en' as const,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  
  return context;
}
