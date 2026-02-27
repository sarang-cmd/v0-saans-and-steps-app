'use client';

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ENTITLEMENTS } from '@/lib/types';
import { FamilyFeatures } from '@/components/FamilyFeatures';

export default function ProfilePage() {
  const { activeProfile, profiles, user, setActiveProfile, updateProfile, createProfile, setEntitlementLevel } = useProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(activeProfile?.name || '');
  const [sensitivity, setSensitivity] = useState(activeProfile?.sensitivity || 'medium');
  const [accessibilityMode, setAccessibilityMode] = useState(activeProfile?.accessibilityMode || 'normal');

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

  const currentEntitlements = user ? ENTITLEMENTS[user.entitlementLevel] : ENTITLEMENTS.free;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50">
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
        {/* Profile Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profiles</CardTitle>
            <CardDescription>Switch between different profiles or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    activeProfile?.id === profile.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <p className="font-semibold text-foreground">{profile.name}</p>
                  <p className="text-sm text-foreground/70 mt-1">
                    Sensitivity: <span className="font-medium">{profile.sensitivity}</span> • Created:{' '}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                const newName = `Profile ${profiles.length + 1}`;
                createProfile(newName);
              }}
              className="w-full"
              variant="outline"
            >
              + Create New Profile
            </Button>
          </CardContent>
        </Card>

        {/* Current Profile Settings */}
        {activeProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Profile: {activeProfile.name}</CardTitle>
              <CardDescription>Customize your health and activity preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingProfile ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="e.g., Work Week"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Respiratory Sensitivity
                    </label>
                    <select
                      value={sensitivity}
                      onChange={(e) => setSensitivity(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="low">Low - I rarely have respiratory issues</option>
                      <option value="medium">Medium - Normal respiratory sensitivity</option>
                      <option value="high">High - I have respiratory concerns (asthma, allergies, etc.)</option>
                    </select>
                    <p className="text-xs text-foreground/70 mt-2">
                      This helps us weight air quality more heavily for health-sensitive users.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Accessibility
                    </label>
                    <select
                      value={accessibilityMode}
                      onChange={(e) => setAccessibilityMode(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="normal">Normal</option>
                      <option value="senior-friendly">Senior-Friendly (Larger text, high contrast)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="flex-1">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditName(activeProfile.name);
                        setSensitivity(activeProfile.sensitivity);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 p-4 bg-card/50 rounded-lg border border-border/50">
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
                      <p className="font-semibold text-foreground">
                        {activeProfile.accessibilityMode === 'senior-friendly'
                          ? 'Senior-Friendly'
                          : 'Normal'}
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => setIsEditingProfile(true)} className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Entitlements / Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Plan</CardTitle>
            <CardDescription>
              Current: <span className="font-semibold capitalize">{user?.entitlementLevel || 'free'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                  <p className="font-semibold text-foreground mb-2">Watch Places Limit</p>
                  <p className="text-lg text-primary font-bold">{currentEntitlements.watchPlacesLimit}</p>
                  <p className="text-xs text-foreground/70 mt-1">Cities you can monitor simultaneously</p>
                </div>

                <div className="p-4 rounded-lg border border-border/50 bg-card/50">
                  <p className="font-semibold text-foreground mb-2">Family Members</p>
                  <p className="text-lg text-secondary font-bold">{currentEntitlements.familyMembersLimit}</p>
                  <p className="text-xs text-foreground/70 mt-1">People you can share data with</p>
                </div>

                {currentEntitlements.level !== 'max' && (
                  <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
                    <p className="text-sm text-foreground mb-2">Premium features available:</p>
                    <ul className="text-xs text-foreground/70 space-y-1">
                      {!currentEntitlements.themes && <li>• Custom themes</li>}
                      {!currentEntitlements.exportData && <li>• Export workout data</li>}
                      {!currentEntitlements.familyCheckIns && <li>• Family check-ins</li>}
                      {!currentEntitlements.automationRules && <li>• Automation rules</li>}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/#pricing">View Plans</a>
                </Button>
                <Button className="w-full" asChild>
                  <a href="/#upgrade">Upgrade Now</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-foreground/70">Auto-switch based on system preference</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
                ⚙️
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-sm text-foreground/70">Alerts for optimal workout times</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
                ⚙️
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
              <div>
                <p className="font-medium text-foreground">Units</p>
                <p className="text-sm text-foreground/70">Celsius & km/h</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors">
                ⚙️
              </button>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
}
