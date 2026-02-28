export type Language = 'en' | 'hi';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.today': 'Today',
    'nav.planner': 'Planner',
    'nav.watch': 'Watch',
    'nav.profile': 'Profile',

    // Today Screen
    'today.title': 'Air Quality & Fitness',
    'today.subtitle': 'Find your perfect workout time',
    'today.aqi': 'Air Quality Index',
    'today.optimal-windows': 'Optimal Workout Windows',
    'today.no-windows': 'No optimal windows today',
    'today.good-air-day': 'Good air day - Great for outdoor activities!',
    'today.poor-air-day': 'Poor air quality - Consider indoor activities',

    // Planner
    'planner.title': 'Weekly Planner',
    'planner.forecast': '7-Day Forecast',
    'planner.best-day': 'Best days for outdoor fitness',
    'planner.peak': 'Peak',
    'planner.active': 'Active',
    'planner.rest': 'Rest',

    // Watch
    'watch.title': 'Multi-City Watch',
    'watch.add-city': 'Add City',
    'watch.manage': 'Manage Cities',
    'watch.no-cities': 'No cities being watched',

    // Profile
    'profile.title': 'Profile & Settings',
    'profile.current-plan': 'Current Plan',
    'profile.upgrade': 'Upgrade Now',
    'profile.features': 'Features',
    'profile.sensitivity': 'Respiratory Sensitivity',
    'profile.low': 'Low',
    'profile.medium': 'Medium',
    'profile.high': 'High',

    // Payment
    'payment.title': 'Upgrade Plan',
    'payment.choose': 'Choose a plan that fits your needs',
    'payment.includes': 'INCLUDES',
    'payment.method': 'PAYMENT METHOD',
    'payment.upi': 'UPI',
    'payment.card': 'Card',
    'payment.free': 'Free',
    'payment.pay': 'Pay',

    // Admin
    'admin.panel': 'QA Admin Panel',
    'admin.toggle-features': 'TOGGLE FEATURES',
    'admin.grants': 'GRANT ENTITLEMENTS',
    'admin.payments': 'MOCK PAYMENTS',

    // Messages
    'msg.loading': 'Loading...',
    'msg.error': 'Error loading data',
    'msg.offline': 'You are offline',
    'msg.success': 'Success',
  },
  hi: {
    // Navigation
    'nav.today': 'आज',
    'nav.planner': 'योजना',
    'nav.watch': 'निगरानी',
    'nav.profile': 'प्रोफाइल',

    // Today Screen
    'today.title': 'वायु गुणवत्ता और फिटनेस',
    'today.subtitle': 'अपने सही व्यायाम का समय खोजें',
    'today.aqi': 'वायु गुणवत्ता सूचकांक',
    'today.optimal-windows': 'इष्टतम व्यायाम खिड़कियाँ',
    'today.no-windows': 'आज कोई इष्टतम विंडो नहीं',
    'today.good-air-day': 'अच्छी हवा वाला दिन - बाहरी गतिविधियों के लिए बेहतरीन!',
    'today.poor-air-day': 'खराब वायु गुणवत्ता - इनडोर गतिविधियों पर विचार करें',

    // Planner
    'planner.title': 'साप्ताहिक योजना',
    'planner.forecast': '7 दिन का पूर्वानुमान',
    'planner.best-day': 'बाहरी फिटनेस के लिए सर्वश्रेष्ठ दिन',
    'planner.peak': 'शिखर',
    'planner.active': 'सक्रिय',
    'planner.rest': 'आराम',

    // Watch
    'watch.title': 'मल्टी-सिटी निगरानी',
    'watch.add-city': 'शहर जोड़ें',
    'watch.manage': 'शहरों को प्रबंधित करें',
    'watch.no-cities': 'कोई शहर निगरानी में नहीं',

    // Profile
    'profile.title': 'प्रोफाइल और सेटिंग्स',
    'profile.current-plan': 'वर्तमान योजना',
    'profile.upgrade': 'अभी अपग्रेड करें',
    'profile.features': 'विशेषताएं',
    'profile.sensitivity': 'श्वसन संवेदनशीलता',
    'profile.low': 'कम',
    'profile.medium': 'मध्यम',
    'profile.high': 'उच्च',

    // Payment
    'payment.title': 'योजना अपग्रेड करें',
    'payment.choose': 'एक योजना चुनें जो आपकी जरूरतों के अनुरूप हो',
    'payment.includes': 'शामिल है',
    'payment.method': 'भुगतान विधि',
    'payment.upi': 'यूपीआई',
    'payment.card': 'कार्ड',
    'payment.free': 'मुक्त',
    'payment.pay': 'भुगतान करें',

    // Admin
    'admin.panel': 'क्यूए प्रशासक पैनल',
    'admin.toggle-features': 'सुविधाओं को टॉगल करें',
    'admin.grants': 'अधिकार प्रदान करें',
    'admin.payments': 'मॉक भुगतान',

    // Messages
    'msg.loading': 'लोड हो रहा है...',
    'msg.error': 'डेटा लोड करने में त्रुटि',
    'msg.offline': 'आप ऑफलाइन हैं',
    'msg.success': 'सफल',
  },
};

class I18n {
  private currentLanguage: Language = 'en';

  constructor() {
    this.loadLanguage();
  }

  /**
   * Get translated string
   */
  t(key: string, defaultValue?: string): string {
    const value = translations[this.currentLanguage]?.[key];
    return value || defaultValue || key;
  }

  /**
   * Set language
   */
  setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('app_language', lang);
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Load language from storage
   */
  private loadLanguage(): void {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('app_language');
    if (stored === 'en' || stored === 'hi') {
      this.currentLanguage = stored;
    } else {
      // Default to English or detect from browser
      const browserLang = navigator.language.split('-')[0];
      this.currentLanguage = browserLang === 'hi' ? 'hi' : 'en';
    }
  }
}

// Singleton instance
export const i18n = new I18n();
