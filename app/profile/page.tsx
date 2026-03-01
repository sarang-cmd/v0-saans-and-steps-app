'use client';

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ENTITLEMENTS } from '@/lib/types';
import { FamilyFeatures } from '@/components/FamilyFeatures';
import { PaymentModal } from '@/components/PaymentModal';
import { AdminPanel } from '@/components/AdminPanel';
import { adminManager } from '@/lib/admin';

export default function ProfilePage() {
  const { activeProfile, profiles, user, setActiveProfile, updateProfile, createProfile, setEntitlementLevel, addFamilyMember, removeFamilyMember } = useProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(activeProfile?.name || '');
  const [sensitivity, setSensitivity] = useState(activeProfile?.sensitivity || 'medium');
  const [accessibilityMode, setAccessibilityMode] = useState(activeProfile?.accessibilityMode || 'normal');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = React.useState(false);

  React.useEffect(() => {
    setIsAdminMode(adminManager.isAdminModeActive());
  }, []);

  const handleSaveProfile = () => {
    if (activeProfile) {
      updateProfile({
        ...activeProfile,
        name: editName,
        sensitivity: sensitivity as any,
        accessibilityMode: accessibilityMode as any,
      });
      setIsEditingProfile(false);
    }
  };

  const handlePaymentSuccess = (plan: any) => {
    setEntitlementLevel(plan);
  };

  const currentEntitlements = user && ENTITLEMENTS[user.entitlementLevel] ? ENTITLEMENTS[user.entitlementLevel] : ENTITLEMENTS['free'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
              <p className="text-foreground/70 text-sm mt-1">Manage your preferences and profiles</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Admin Panel */}
        <AdminPanel />

        {/* Current Plan */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Your Plan</CardTitle>
            <CardDescription>Upgrade to unlock more features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/70">Current Plan</p>
                <p className="text-2xl font-bold text-primary capitalize">{user?.entitlementLevel || 'free'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Features</p>
                <p className="text-sm text-foreground mt-1">
                  {currentEntitlements.watchPlacesLimit} cities • {currentEntitlements.exportData ? 'CSV/JSON export' : 'No export'} • {currentEntitlements.themes ? 'Themes' : 'Light/Dark only'}
                </p>
              </div>
            </div>
            {user?.entitlementLevel !== 'max' && (
              <Button onClick={() => setIsPaymentOpen(true)} className="w-full">
                Upgrade Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Profile Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profiles</CardTitle>
            <CardDescription>Switch between different profiles or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {profiles && profiles.length > 0 ? profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeProfile?.id === profile.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  aria-pressed={activeProfile?.id === profile.id}
                  aria-label={`Select profile: ${profile.name}, Sensitivity: ${profile.sensitivity}`}
                >
                  <h3 className="font-semibold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-foreground/60 mt-1">Sensitivity: {profile.sensitivity}</p>
                </button>
              )) : (
                <p className="text-foreground/70">No profiles yet</p>
              )}
            </div>

            <Button onClick={() => createProfile('New Profile')} variant="outline" className="w-full">
              Create New Profile
            </Button>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        {activeProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Profile: {activeProfile.name}</CardTitle>
              <CardDescription>Customize your profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingProfile ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground/70">Name</p>
                      <p className="font-semibold text-foreground">{activeProfile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Respiratory Sensitivity</p>
                      <p className="font-semibold text-foreground capitalize">{activeProfile.sensitivity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Accessibility Mode</p>
                      <p className="font-semibold text-foreground">{activeProfile.accessibilityMode === 'senior-friendly' ? 'Senior-Friendly' : 'Normal'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/70">Language</p>
                      <p className="font-semibold text-foreground">{activeProfile.language === 'en' ? 'English' : 'हिन्दी (Hindi)'}</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground">Profile Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 mt-1 bg-input border border-border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Respiratory Sensitivity</label>
                    <select
                      value={sensitivity}
                      onChange={(e) => setSensitivity(e.target.value)}
                      className="w-full px-3 py-2 mt-1 bg-input border border-border rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Accessibility Mode</label>
                    <select
                      value={accessibilityMode}
                      onChange={(e) => setAccessibilityMode(e.target.value)}
                      className="w-full px-3 py-2 mt-1 bg-input border border-border rounded-lg"
                    >
                      <option value="normal">Normal</option>
                      <option value="senior-friendly">Senior-Friendly</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSaveProfile} className="flex-1">
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Firebase Setup */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Integration</CardTitle>
              <CardDescription>Sign in and configure Firebase for cloud sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <a href="/auth">Sign In / Create Account</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/firebase-setup">Configure Firebase</a>
                </Button>
              </div>
              <p className="text-sm text-foreground/60">
                Firebase is optional. Your data is saved locally by default. Sign in to sync across devices.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Access */}
        <div className="mt-8">
          <Card className={isAdminMode ? 'border-violet-400 bg-violet-50/30 dark:bg-violet-900/10' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin Panel
              </CardTitle>
              <CardDescription>
                {isAdminMode ? 'Admin mode is active. Panel is accessible.' : 'Tap the logo 7 times or use an admin account to unlock.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAdminMode ? (
                <>
                  <p className="text-sm text-foreground/70">
                    Admin mode is active. Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Ctrl+Shift+A</kbd> anywhere to toggle the panel.
                  </p>
                  <Button
                    onClick={() => {
                      // Dispatch keyboard shortcut event to open admin panel
                      window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'A', bubbles: true }));
                    }}
                    variant="outline"
                    className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:border-violet-700 dark:hover:bg-violet-900/20"
                  >
                    Open Admin Panel
                  </Button>
                </>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild size="sm">
                    <a href="/auth">Sign In as Admin</a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Register 7 taps quickly
                      for (let i = 0; i < 7; i++) adminManager.registerLogoTap();
                      setIsAdminMode(adminManager.isAdminModeActive());
                    }}
                  >
                    Unlock (Debug)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="mt-8">
          <Button variant="outline" asChild className="w-full md:w-auto">
            <a href="/settings">Notifications & Reminders Settings</a>
          </Button>
        </div>

        {/* Family Features Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Family & Social</h2>
          <FamilyFeatures
            familyMembers={user?.familyMembers || []}
            entitlementLevel={user?.entitlementLevel || 'free'}
            onAddMember={addFamilyMember}
            onRemoveMember={removeFamilyMember}
          />
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 rounded-lg border border-border/30 bg-foreground/5">
          <p className="text-xs text-foreground/60">
            <strong>Debug:</strong> Profile ID: {activeProfile?.id} • Active: {user?.activeProfileId}
          </p>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        currentPlan={user?.entitlementLevel || 'free'}
      />
    </div>
  );
}
