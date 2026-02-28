export type FeatureFlag = 
  | 'real-api'
  | 'demo-mode'
  | 'firebase-enabled'
  | 'payment-enabled'
  | 'notifications-enabled'
  | 'multilingual'
  | 'senior-friendly'
  | 'map-view'
  | 'heatmap-view'
  | 'automation-rules'
  | 'camera-grid'
  | 'backend-kit'
  | 'offline-mode'
  | 'pwa-install'
  | 'analytics'
  | 'family-features'
  | 'watch-limit-3'
  | 'watch-limit-5'
  | 'watch-limit-15'
  | 'export-csv'
  | 'export-pdf'
  | 'themes'
  | 'dark-mode'
  | 'custom-locations'
  | 'schedule-workouts'
  | 'recurring-reminders'
  | 'health-tips'
  | 'weather-alerts'
  | 'pollution-alerts'
  | 'nearby-gyms'
  | 'air-quality-history'
  | 'trend-analysis'
  | 'comparative-view'
  | 'social-sharing'
  | 'leaderboards'
  | 'badges'
  | 'achievements'
  | 'community-events'
  | 'expert-articles'
  | 'video-tutorials';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'qa';
  createdAt: string;
  credits: number;
  permissions: string[];
}

export interface FeatureFlagConfig {
  name: FeatureFlag;
  enabled: boolean;
  description: string;
  lastModified: string;
  modifiedBy?: string;
}

export interface QATestSession {
  id: string;
  adminId: string;
  startTime: string;
  endTime?: string;
  testsPassed: number;
  testsFailed: number;
  notes: string;
}

class AdminManager {
  private currentAdmin: AdminUser | null = null;
  private featureFlags: Map<FeatureFlag, FeatureFlagConfig> = new Map();
  private testSessions: QATestSession[] = [];
  private isAdminMode = false;
  private tapCount = 0;
  private tapTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadStateFromStorage();
    this.initializeDefaultFlags();
  }

  /**
   * Detect 7-tap gesture on logo to enable admin mode
   */
  registerLogoTap(): void {
    this.tapCount++;

    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }

    if (this.tapCount === 7) {
      this.isAdminMode = true;
      localStorage.setItem('admin_mode', 'true');
      console.log('[v0] Admin mode unlocked!');
      this.tapCount = 0;
      return;
    }

    this.tapTimeout = setTimeout(() => {
      this.tapCount = 0;
    }, 2000);
  }

  /**
   * Check if admin mode is active
   */
  isAdminModeActive(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('admin_mode');
    return stored === 'true' || this.isAdminMode;
  }

  /**
   * Set admin user
   */
  setAdminUser(admin: AdminUser): void {
    this.currentAdmin = admin;
    localStorage.setItem('admin_user', JSON.stringify(admin));
  }

  /**
   * Get current admin
   */
  getAdminUser(): AdminUser | null {
    if (!this.currentAdmin) {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        try {
          this.currentAdmin = JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return this.currentAdmin;
  }

  /**
   * Get or create mock admin
   */
  getMockAdmin(): AdminUser {
    const existing = this.getAdminUser();
    if (existing) return existing;

    const mockAdmin: AdminUser = {
      id: 'admin_' + Math.random().toString(36).substring(7),
      email: 'admin@saans.local',
      role: 'admin',
      createdAt: new Date().toISOString(),
      credits: 10000, // Mock credits for testing payments
      permissions: ['*'], // All permissions
    };

    this.setAdminUser(mockAdmin);
    return mockAdmin;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlagConfig[] {
    return Array.from(this.featureFlags.values());
  }

  /**
   * Get feature flag status
   */
  isFeatureEnabled(flag: FeatureFlag): boolean {
    const config = this.featureFlags.get(flag);
    return config?.enabled ?? false;
  }

  /**
   * Toggle feature flag
   */
  toggleFeature(flag: FeatureFlag): void {
    const config = this.featureFlags.get(flag);
    if (config) {
      config.enabled = !config.enabled;
      config.lastModified = new Date().toISOString();
      config.modifiedBy = this.currentAdmin?.email;
      this.featureFlags.set(flag, config);
      this.saveStateToStorage();
    }
  }

  /**
   * Set feature flag
   */
  setFeature(flag: FeatureFlag, enabled: boolean): void {
    const config = this.featureFlags.get(flag) || {
      name: flag,
      enabled: false,
      description: '',
      lastModified: new Date().toISOString(),
    };
    config.enabled = enabled;
    config.lastModified = new Date().toISOString();
    config.modifiedBy = this.currentAdmin?.email;
    this.featureFlags.set(flag, config);
    this.saveStateToStorage();
  }

  /**
   * Grant entitlement to user
   */
  grantEntitlement(
    userId: string,
    plan: 'free' | 'no-ads' | 'pro' | 'max',
    durationDays: number = 30
  ): void {
    const entitlements = JSON.parse(localStorage.getItem('admin_grants') || '{}');
    entitlements[userId] = {
      plan,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      grantedBy: this.currentAdmin?.email,
    };
    localStorage.setItem('admin_grants', JSON.stringify(entitlements));
  }

  /**
   * Get admin grants
   */
  getAdminGrants(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem('admin_grants') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Start QA test session
   */
  startTestSession(): QATestSession {
    const session: QATestSession = {
      id: 'session_' + Math.random().toString(36).substring(7),
      adminId: this.currentAdmin?.id || 'unknown',
      startTime: new Date().toISOString(),
      testsPassed: 0,
      testsFailed: 0,
      notes: '',
    };

    this.testSessions.push(session);
    return session;
  }

  /**
   * End QA test session
   */
  endTestSession(sessionId: string): QATestSession | null {
    const session = this.testSessions.find((s) => s.id === sessionId);
    if (session) {
      session.endTime = new Date().toISOString();
      this.saveStateToStorage();
      return session;
    }
    return null;
  }

  /**
   * Log test result
   */
  logTestResult(sessionId: string, passed: boolean): void {
    const session = this.testSessions.find((s) => s.id === sessionId);
    if (session) {
      if (passed) {
        session.testsPassed++;
      } else {
        session.testsFailed++;
      }
    }
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: Record<FeatureFlag, string> = {
      'real-api': 'Use real OpenAQ API for air quality data',
      'demo-mode': 'Use simulated demo data',
      'firebase-enabled': 'Enable Firebase integration',
      'payment-enabled': 'Enable payment system',
      'notifications-enabled': 'Enable notifications and reminders',
      'multilingual': 'Enable English/Hindi bilingual support',
      'senior-friendly': 'Enable senior-friendly mode',
      'map-view': 'Show map view of air quality',
      'heatmap-view': 'Show heatmap overlay',
      'automation-rules': 'Allow automation rules',
      'camera-grid': 'Enable camera grid view',
      'backend-kit': 'Enable backend kit generator',
      'offline-mode': 'Enable offline mode',
      'pwa-install': 'Enable PWA installation',
      'analytics': 'Enable analytics tracking',
      'family-features': 'Enable family features',
      'watch-limit-3': 'Allow 3 city watch limit',
      'watch-limit-5': 'Allow 5 city watch limit',
      'watch-limit-15': 'Allow 15 city watch limit',
      'export-csv': 'Enable CSV export',
      'export-pdf': 'Enable PDF export',
      'themes': 'Enable custom themes',
      'dark-mode': 'Enable dark mode',
      'custom-locations': 'Allow custom location creation',
      'schedule-workouts': 'Enable workout scheduling',
      'recurring-reminders': 'Enable recurring reminders',
      'health-tips': 'Show health tips',
      'weather-alerts': 'Send weather alerts',
      'pollution-alerts': 'Send pollution alerts',
      'nearby-gyms': 'Show nearby gyms',
      'air-quality-history': 'Show air quality history',
      'trend-analysis': 'Show trend analysis',
      'comparative-view': 'Show comparative view',
      'social-sharing': 'Enable social sharing',
      'leaderboards': 'Enable leaderboards',
      'badges': 'Enable badges system',
      'achievements': 'Enable achievements',
      'community-events': 'Show community events',
      'expert-articles': 'Show expert articles',
      'video-tutorials': 'Show video tutorials',
    };

    for (const [flag, description] of Object.entries(defaultFlags)) {
      if (!this.featureFlags.has(flag as FeatureFlag)) {
        // Enable critical features by default
        const enabled = ['real-api', 'notifications-enabled', 'offline-mode', 'pwa-install', 'dark-mode'].includes(flag);
        
        this.featureFlags.set(flag as FeatureFlag, {
          name: flag as FeatureFlag,
          enabled,
          description,
          lastModified: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Save state to localStorage
   */
  private saveStateToStorage(): void {
    try {
      const flags = Array.from(this.featureFlags.entries());
      localStorage.setItem('admin_feature_flags', JSON.stringify(flags));
      localStorage.setItem('admin_test_sessions', JSON.stringify(this.testSessions));
    } catch (error) {
      console.error('[v0] Error saving admin state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadStateFromStorage(): void {
    try {
      const flags = localStorage.getItem('admin_feature_flags');
      if (flags) {
        const entries = JSON.parse(flags);
        this.featureFlags = new Map(entries);
      }

      const sessions = localStorage.getItem('admin_test_sessions');
      if (sessions) {
        this.testSessions = JSON.parse(sessions);
      }
    } catch (error) {
      console.error('[v0] Error loading admin state:', error);
    }
  }
}

// Singleton instance
export const adminManager = new AdminManager();
