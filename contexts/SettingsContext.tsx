'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hi';
type Theme = 'light' | 'dark' | 'system';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.today': 'Today',
    'nav.planner': 'Planner',
    'nav.watch': 'Watch',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'button.upgrade': 'Upgrade Now',
    'button.back': 'Back to Home',
    'plan.current': 'Current Plan',
    'plan.features': 'Features',
    'plan.cities': 'cities',
    'profile.title': 'Profile & Settings',
    'profile.subtitle': 'Manage your preferences and profiles',
    'weather.temperature': 'Temperature',
    'weather.humidity': 'Humidity',
    'weather.wind': 'Wind Speed',
    'aqi.good': 'Good',
    'aqi.moderate': 'Moderate',
    'aqi.poor': 'Poor',
    'aqi.veryPoor': 'Very Poor',
  },
  hi: {
    'nav.today': 'आज',
    'nav.planner': 'योजनाकार',
    'nav.watch': 'नजरिया',
    'nav.profile': 'प्रोफाइल',
    'nav.settings': 'सेटिंग्स',
    'button.upgrade': 'अभी अपग्रेड करें',
    'button.back': 'होम पर वापस',
    'plan.current': 'वर्तमान योजना',
    'plan.features': 'सुविधाएं',
    'plan.cities': 'शहर',
    'profile.title': 'प्रोफाइल और सेटिंग्स',
    'profile.subtitle': 'अपनी वरीयताएं प्रबंधित करें',
    'weather.temperature': 'तापमान',
    'weather.humidity': 'नमी',
    'weather.wind': 'हवा की गति',
    'aqi.good': 'अच्छा',
    'aqi.moderate': 'मध्यम',
    'aqi.poor': 'खराब',
    'aqi.veryPoor': 'बहुत खराब',
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLanguage = localStorage.getItem('saans_language') as Language || 'en';
    const savedTheme = localStorage.getItem('saans_theme') as Theme || 'system';

    setLanguageState(savedLanguage);
    setThemeState(savedTheme);
    setMounted(true);

    // Apply theme to document
    applyTheme(savedTheme);

    // Set HTML lang attribute for Hindi
    document.documentElement.lang = savedLanguage === 'hi' ? 'hi-IN' : 'en-US';
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let resolvedTheme = newTheme;

    if (newTheme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('saans_language', lang);
      document.documentElement.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('saans_theme', newTheme);
    }
    applyTheme(newTheme);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      language: 'en' as const,
      setLanguage: () => {},
      theme: 'auto' as const,
      setTheme: () => {},
    };
  }
  return context;
}
