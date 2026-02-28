'use client';

import React, { useState, useEffect } from 'react';
import { adminManager, type FeatureFlag } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState(adminManager.getMockAdmin());
  const [flags, setFlags] = useState(adminManager.getAllFlags());
  const [activeTab, setActiveTab] = useState<'flags' | 'grants' | 'payments'>('flags');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggleFlag = (flag: FeatureFlag) => {
    adminManager.toggleFeature(flag);
    setFlags(adminManager.getAllFlags());
  };

  const handleGrantPlan = (plan: 'free' | 'no-ads' | 'pro' | 'max') => {
    const userId = (window as any).currentUserId || 'demo-user';
    adminManager.grantEntitlement(userId, plan, 30);
    alert(`Granted ${plan} plan to ${userId}`);
  };

  const handleMockPayment = async () => {
    const { paymentManager } = await import('@/lib/payments');
    const userId = (window as any).currentUserId || 'demo-user';
    const payment = await paymentManager.processMockPayment('pro', userId, 'mock');
    alert(`Mock payment created: ${payment.id}`);
  };

  if (!adminManager.isAdminModeActive()) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:shadow-xl transition"
          title="Admin Panel (Ctrl+Shift+A)"
        >
          ⚙️
        </button>
      ) : (
        <Card className="bg-card border-border shadow-2xl max-h-96 overflow-y-auto">
          <CardHeader className="sticky top-0 bg-card border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">QA Admin Panel</CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <CardDescription>{admin.email} (Credits: {admin.credits})</CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              {(['flags', 'grants', 'payments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Feature Flags Tab */}
            {activeTab === 'flags' && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <p className="text-xs text-foreground/60 font-medium">TOGGLE FEATURES</p>
                {flags.slice(0, 10).map((flag) => (
                  <div
                    key={flag.name}
                    className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-mono font-bold">{flag.name}</p>
                      <p className="text-xs text-foreground/60">{flag.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggleFlag(flag.name)}
                      className={`ml-2 px-2 py-1 text-xs rounded font-medium transition ${
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
            )}

            {/* Grants Tab */}
            {activeTab === 'grants' && (
              <div className="space-y-2">
                <p className="text-xs text-foreground/60 font-medium">GRANT ENTITLEMENTS</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['free', 'no-ads', 'pro', 'max'] as const).map((plan) => (
                    <Button
                      key={plan}
                      onClick={() => handleGrantPlan(plan)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-2">
                <p className="text-xs text-foreground/60 font-medium">MOCK PAYMENTS</p>
                <Button
                  onClick={handleMockPayment}
                  size="sm"
                  className="w-full text-xs"
                >
                  Create Mock Payment
                </Button>
                <div className="text-xs bg-muted/30 p-2 rounded">
                  <p className="font-mono text-foreground/60">Admin Credits: {admin.credits}</p>
                  <p className="text-foreground/60 mt-1">Use to test payment flow</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
