'use client';

import React, { useState, useEffect } from 'react';
import { firebaseManager, type FirebaseConfig } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirebaseSetupPage() {
  const [config, setConfig] = useState<Partial<FirebaseConfig>>({});
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    setIsEnabled(firebaseManager.isInitialized());
  }, []);

  const handleInputChange = (key: keyof FirebaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (
      config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId
    ) {
      firebaseManager.saveConfigToStorage(config as FirebaseConfig);
      setIsEnabled(true);
      alert('Firebase configured successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset Firebase configuration?')) {
      firebaseManager.resetConfig();
      setConfig({});
      setIsEnabled(false);
      alert('Firebase configuration reset');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Firebase Setup</h1>
              <p className="text-foreground/70 text-sm mt-1">Optional cloud configuration</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/profile">Back</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <p className="font-medium">
                {isEnabled ? 'Firebase Configured' : 'Firebase Not Configured'}
              </p>
            </div>
            <p className="text-sm text-foreground/70 mt-2">
              Firebase is completely optional. The app works 100% without it. Use it for:
            </p>
            <ul className="text-sm text-foreground/70 mt-2 space-y-1 ml-4">
              <li>• Cloud backup and sync across devices</li>
              <li>• Authentication and user management</li>
              <li>• Real-time data updates</li>
              <li>• Analytics and crash reporting</li>
            </ul>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>
              Paste your Firebase config from the Google Firebase Console
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-300">
              Get your config from{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Firebase Console
              </a>{' '}
              → Project Settings → Web App Configuration
            </div>

            {/* Config Fields */}
            <div className="space-y-4">
              {(
                [
                  'apiKey',
                  'authDomain',
                  'projectId',
                  'storageBucket',
                  'messagingSenderId',
                  'appId',
                ] as (keyof FirebaseConfig)[]
              ).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {key}
                  </label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={config[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={`Enter your Firebase ${key}`}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono"
                  />
                </div>
              ))}
            </div>

            {/* Show/Hide Secrets */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSecrets}
                  onChange={(e) => setShowSecrets(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground/70">Show secrets</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                Save Configuration
              </Button>
              {isEnabled && (
                <Button onClick={handleReset} variant="destructive" className="flex-1">
                  Reset Firebase
                </Button>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-900 dark:text-yellow-300">
              Your Firebase config is stored locally in your browser. It's safe, but never share
              your credentials. Your API key is restricted to specific operations in Firebase.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
