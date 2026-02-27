'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const OfflineNotification: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 max-w-md rounded-lg p-4 shadow-lg transition-all z-50',
        isOnline
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      )}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <span className="text-xl">✓</span>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">Back Online</p>
              <p className="text-sm text-green-600 dark:text-green-400">Your data will sync now</p>
            </div>
          </>
        ) : (
          <>
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-700 dark:text-yellow-300">You're Offline</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Using cached data. Changes will sync when online.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[v0] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('[v0] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
};
