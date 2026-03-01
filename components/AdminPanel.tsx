'use client';

import React, { useState, useEffect } from 'react';
import { adminManager, type FeatureFlag } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'grants' | 'payments' | 'settings'>('overview');
  const [flags, setFlags] = useState<ReturnType<typeof adminManager.getAllFlags>>([]);
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('glassmorphism_enabled') === 'true';
    }
    return false;
  });
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggleFlag = (flagName: string) => {
    adminManager.setFeatureFlag(flagName, !flags.find(f => f.name === flagName)?.enabled);
    setFlags(adminManager.getAllFlags());
  };

  const handleToggleGlassmorphism = () => {
    const newValue = !glassmorphismEnabled;
    setGlassmorphismEnabled(newValue);
    localStorage.setItem('glassmorphism_enabled', String(newValue));
    
    const html = document.documentElement;
    if (newValue) {
      html.classList.add('glassmorphism-mode');
    } else {
      html.classList.remove('glassmorphism-mode');
    }
  };

  const handleGrantPlan = (plan: 'free' | 'no-ads' | 'pro' | 'max') => {
    adminManager.grantEntitlement('current-user', plan, 30);
    alert(`✓ Granted ${plan} plan for 30 days`);
  };

  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Load on client only to avoid SSR issues
    setFlags(adminManager.getAllFlags());
    setIsAdminMode(adminManager.isAdminModeActive());
  }, []);

  if (!isAdminMode) {
    return null;
  }

  const glassClass = glassmorphismEnabled 
    ? 'glass shadow-2xl backdrop-blur-lg' 
    : 'bg-card border border-border shadow-lg';

  return (
    <div className="fixed bottom-32 right-6 z-40 w-80">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="glass bg-primary/80 text-primary-foreground rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition flex items-center justify-center font-bold text-lg"
          title="Admin Panel (Ctrl+Shift+A)"
        >
          ⚙️
        </button>
      ) : (
        <Card className={`max-h-[600px] overflow-y-auto ${glassClass}`}>
          <CardHeader className="sticky top-0 bg-background/80 backdrop-blur border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Admin Panel</CardTitle>
                <CardDescription className="text-xs">QA Testing & Feature Control</CardDescription>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground text-xl font-bold"
              >
                ✕
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-border/30">
              {(['overview', 'features', 'grants', 'payments', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground/70">ADMIN INFO</p>
                  <div className="text-xs bg-muted/30 rounded p-2 space-y-1">
                    <p><span className="font-mono">Theme:</span> {theme}</p>
                    <p><span className="font-mono">Mode:</span> Admin Active ✓</p>
                    <p><span className="font-mono">Glassmorphism:</span> {glassmorphismEnabled ? 'ON' : 'OFF'}</p>
                  </div>
                </div>
                <Button
                  onClick={handleToggleGlassmorphism}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  {glassmorphismEnabled ? 'Disable' : 'Enable'} Glassmorphism
                </Button>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground/70 mb-2">FEATURE FLAGS</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {flags.slice(0, 12).map((flag) => (
                    <div
                      key={flag.name}
                      className="flex items-center justify-between p-2 rounded border border-border/30 hover:bg-muted/30 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-bold truncate">{flag.name}</p>
                        <p className="text-xs text-foreground/50 truncate">{flag.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleFlag(flag.name)}
                        className={`ml-2 px-2 py-1 text-xs rounded font-medium text-xs whitespace-nowrap ${
                          flag.enabled
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {flag.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grants Tab */}
            {activeTab === 'grants' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground/70">GRANT PLANS</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['free', 'no-ads', 'pro', 'max'] as const).map((plan) => (
                    <Button
                      key={plan}
                      onClick={() => handleGrantPlan(plan)}
                      size="sm"
                      variant="outline"
                      className="text-xs h-8"
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
                <div className="text-xs bg-muted/30 rounded p-2">
                  <p className="font-mono">All plans grant 30-day access</p>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground/70">PAYMENT TESTING</p>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => alert('Mock payment flow configured')}
                >
                  Test Payment Flow
                </Button>
                <div className="text-xs bg-muted/30 rounded p-2 space-y-1">
                  <p><span className="font-mono">Status:</span> Mock Mode Active</p>
                  <p><span className="font-mono">Gateway:</span> Stripe Mock</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground/70">VISUAL SETTINGS</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded border border-border/30">
                    <span className="text-xs font-medium">Glassmorphism Design</span>
                    <button
                      onClick={handleToggleGlassmorphism}
                      className={`w-10 h-6 rounded-full transition flex items-center ${
                        glassmorphismEnabled
                          ? 'bg-primary/70 justify-end'
                          : 'bg-muted justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
                <div className="text-xs bg-muted/30 rounded p-2">
                  <p className="font-mono mb-1">Shortcut: Ctrl+Shift+A</p>
                  <p className="text-foreground/60">Toggle admin panel on/off</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
