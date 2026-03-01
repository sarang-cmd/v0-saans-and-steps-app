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
    'today.aqi': 'Air Quality Index',
    'today.optimal-windows': 'Optimal Workout Windows',
    'today.no-windows': 'No optimal windows today',
    'today.good-air-day': 'Good air day - Great for outdoor activities!',
    'today.poor-air-day': 'Poor air quality - Consider indoor activities',
    'planner.title': 'Weekly Planner',
    'planner.forecast': '7-Day Forecast',
    'planner.best-day': 'Best days for outdoor fitness',
    'watch.title': 'Multi-City Watch',
    'watch.add-city': 'Add City',
    'watch.manage': 'Manage Cities',
    'watch.no-cities': 'No cities being watched',
    'profile.title': 'Profile & Settings',
    'profile.current-plan': 'Current Plan',
    'profile.upgrade': 'Upgrade Now',
    'profile.features': 'Features',
    'profile.sensitivity': 'Respiratory Sensitivity',
    'profile.low': 'Low',
    'profile.medium': 'Medium',
    'profile.high': 'High',
    'payment.title': 'Upgrade Plan',
    'payment.choose': 'Choose a plan that fits your needs',
    'payment.includes': 'INCLUDES',
    'payment.method': 'PAYMENT METHOD',
    'payment.upi': 'UPI',
    'payment.card': 'Card',
    'payment.free': 'Free',
    'payment.pay': 'Pay',
    'msg.loading': 'Loading...',
    'msg.error': 'Error loading data',
    'msg.offline': 'You are offline',
    'msg.success': 'Success',
    'settings.title': 'Settings',
    'settings.back': 'Back to Home',
    'settings.location': 'Your Location',
    'settings.health-tips': 'Health Tips',
  },
  hi: {
    'nav.today': 'आज',
    'nav.planner': 'योजना',
    'nav.watch': 'निगरानी',
    'nav.profile': 'प्रोफाइल',
    'today.title': 'वायु गुणवत्ता और फिटनेस',
    'today.subtitle': 'अपने सही व्यायाम का समय खोजें',
    'today.aqi': 'वायु गुणवत्ता सूचकांक',
    'today.optimal-windows': 'इष्टतम व्यायाम खिड़कियाँ',
    'today.no-windows': 'आज कोई इष्टतम विंडो नहीं',
    'today.good-air-day': 'अच्छी हवा वाला दिन - बाहरी गतिविधियों के लिए बेहतरीन!',
    'today.poor-air-day': 'खराब वायु गुणवत्ता - इनडोर गतिविधियों पर विचार करें',
    'planner.title': 'साप्ताहिक योजना',
    'planner.forecast': '7 दिन का पूर्वानुमान',
    'planner.best-day': 'बाहरी फिटनेस के लिए सर्वश्रेष्ठ दिन',
    'watch.title': 'मल्टी-सिटी निगरानी',
    'watch.add-city': 'शहर जोड़ें',
    'watch.manage': 'शहरों को प्रबंधित करें',
    'watch.no-cities': 'कोई शहर निगरानी में नहीं',
    'profile.title': 'प्रोफाइल और सेटिंग्स',
    'profile.current-plan': 'वर्तमान योजना',
    'profile.upgrade': 'अभी अपग्रेड करें',
    'profile.features': 'विशेषताएं',
    'profile.sensitivity': 'श्वसन संवेदनशीलता',
    'profile.low': 'कम',
    'profile.medium': 'मध्यम',
    'profile.high': 'उच्च',
    'payment.title': 'योजना अपग्रेड करें',
    'payment.choose': 'एक योजना चुनें जो आपकी जरूरतों के अनुरूप हो',
    'payment.includes': 'शामिल है',
    'payment.method': 'भुगतान विधि',
    'payment.upi': 'यूपीआई',
    'payment.card': 'कार्ड',
    'payment.free': 'मुक्त',
    'payment.pay': 'भुगतान करें',
    'msg.loading': 'लोड हो रहा है...',
    'msg.error': 'डेटा लोड करने में त्रुटि',
    'msg.offline': 'आप ऑफलाइन हैं',
    'msg.success': 'सफल',
    'settings.title': 'सेटिंग्स',
    'settings.back': 'होम पर वापस जाएं',
    'settings.location': 'आपका स्थान',
    'settings.health-tips': 'स्वास्थ्य सुझाव',
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
