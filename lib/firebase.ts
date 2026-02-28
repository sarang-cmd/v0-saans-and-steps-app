import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

class FirebaseManager {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private isEnabled = false;
  private config: FirebaseConfig | null = null;

  /**
   * Initialize Firebase with config
   */
  initialize(config: FirebaseConfig): void {
    try {
      this.config = config;
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      this.isEnabled = true;
      console.log('[v0] Firebase initialized successfully');
    } catch (error) {
      console.error('[v0] Firebase initialization error:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Load Firebase config from localStorage
   */
  loadConfigFromStorage(): FirebaseConfig | null {
    try {
      const config = localStorage.getItem('firebase_config');
      if (config) {
        const parsed = JSON.parse(config);
        this.initialize(parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[v0] Error loading Firebase config:', error);
    }
    return null;
  }

  /**
   * Save Firebase config to localStorage
   */
  saveConfigToStorage(config: FirebaseConfig): void {
    try {
      localStorage.setItem('firebase_config', JSON.stringify(config));
      this.initialize(config);
    } catch (error) {
      console.error('[v0] Error saving Firebase config:', error);
    }
  }

  /**
   * Check if Firebase is enabled
   */
  isInitialized(): boolean {
    return this.isEnabled && this.app !== null;
  }

  /**
   * Get Auth instance
   */
  getAuth(): Auth | null {
    return this.isEnabled ? this.auth : null;
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore | null {
    return this.isEnabled ? this.firestore : null;
  }

  /**
   * Disable Firebase
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Reset Firebase config
   */
  resetConfig(): void {
    localStorage.removeItem('firebase_config');
    this.isEnabled = false;
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.config = null;
  }
}

// Singleton instance
export const firebaseManager = new FirebaseManager();

// Auto-load config on init
if (typeof window !== 'undefined') {
  firebaseManager.loadConfigFromStorage();
}
