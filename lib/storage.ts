// Local Storage utilities for Saans & Steps
const STORAGE_PREFIX = 'saans_steps_';

interface StorageEntry {
  key: string;
  version: number;
}

const STORAGE_KEYS: Record<string, StorageEntry> = {
  user: { key: `${STORAGE_PREFIX}user`, version: 1 },
  profiles: { key: `${STORAGE_PREFIX}profiles`, version: 1 },
  places: { key: `${STORAGE_PREFIX}places`, version: 1 },
  workoutSessions: { key: `${STORAGE_PREFIX}workout_sessions`, version: 1 },
  familyMembers: { key: `${STORAGE_PREFIX}family_members`, version: 1 },
  onboarding: { key: `${STORAGE_PREFIX}onboarding`, version: 1 },
  preferences: { key: `${STORAGE_PREFIX}preferences`, version: 1 },
  openaqKey: { key: `${STORAGE_PREFIX}openaq_key`, version: 1 },
};

export function getFromStorage<T>(keyName: keyof typeof STORAGE_KEYS): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const entry = STORAGE_KEYS[keyName];
    const item = localStorage.getItem(entry.key);

    if (!item) return null;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[v0] Error reading ${keyName} from storage:`, error);
    return null;
  }
}

export function saveToStorage<T>(keyName: keyof typeof STORAGE_KEYS, data: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const entry = STORAGE_KEYS[keyName];
    localStorage.setItem(entry.key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[v0] Error saving ${keyName} to storage:`, error);
    return false;
  }
}

export function removeFromStorage(keyName: keyof typeof STORAGE_KEYS): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const entry = STORAGE_KEYS[keyName];
    localStorage.removeItem(entry.key);
    return true;
  } catch (error) {
    console.error(`[v0] Error removing ${keyName} from storage:`, error);
    return false;
  }
}

export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    Object.values(STORAGE_KEYS).forEach((entry) => {
      localStorage.removeItem(entry.key);
    });
    return true;
  } catch (error) {
    console.error('[v0] Error clearing all storage:', error);
    return false;
  }
}

// Cache utilities with TTL support
export class StorageCache {
  private static readonly CACHE_TTL_MS = {
    airQuality: 30 * 60 * 1000, // 30 minutes
    weather: 60 * 60 * 1000, // 1 hour
    places: 24 * 60 * 60 * 1000, // 1 day
  };

  static getCacheKey(prefix: string, id: string): string {
    return `${STORAGE_PREFIX}cache_${prefix}_${id}`;
  }

  static setAirQualityCache(placeId: string, data: any): void {
    if (typeof window === 'undefined') return;
    const key = this.getCacheKey('aq', placeId);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL_MS.airQuality,
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  }

  static getAirQualityCache(placeId: string): any | null {
    if (typeof window === 'undefined') return null;
    const key = this.getCacheKey('aq', placeId);
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const cached = JSON.parse(item);
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  static setWeatherCache(placeId: string, data: any): void {
    if (typeof window === 'undefined') return;
    const key = this.getCacheKey('weather', placeId);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL_MS.weather,
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  }

  static getWeatherCache(placeId: string): any | null {
    if (typeof window === 'undefined') return null;
    const key = this.getCacheKey('weather', placeId);
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const cached = JSON.parse(item);
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  static clearExpiredCache(): void {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(`${STORAGE_PREFIX}cache_`)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const cached = JSON.parse(item);
            if (cached.expiresAt && cached.expiresAt < now) {
              localStorage.removeItem(key);
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
    }
  }
}
