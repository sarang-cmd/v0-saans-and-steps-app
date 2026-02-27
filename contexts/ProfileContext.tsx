'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, User, EntitlementLevel } from '@/lib/types';
import { getFromStorage, saveToStorage } from '@/lib/storage';

interface ProfileContextType {
  activeProfile: Profile | null;
  profiles: Profile[];
  user: User | null;
  isLoading: boolean;
  setActiveProfile: (profileId: string) => void;
  createProfile: (name: string) => Profile;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  setEntitlementLevel: (level: EntitlementLevel) => void;
  addFamilyMember: (name: string, relation: string) => void;
  removeFamilyMember: (memberId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Default first profile
const createDefaultProfile = (): Profile => ({
  id: `profile-${Date.now()}`,
  name: 'My Profile',
  age: undefined,
  sensitivity: 'medium',
  preferredActivities: ['walking', 'running', 'cycling'],
  language: 'en',
  accessibilityMode: 'normal',
  createdAt: new Date().toISOString(),
});

// Default user
const createDefaultUser = (): User => ({
  activeProfileId: '',
  profiles: [createDefaultProfile()],
  entitlementLevel: 'free',
  familyMembers: [],
  watchPlaces: [],
  preferences: {
    theme: 'auto',
    autoNotifications: false,
    useMetricUnits: true,
  },
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user data from storage
  useEffect(() => {
    const savedUser = getFromStorage<User>('user');
    const savedProfiles = getFromStorage<Profile[]>('profiles');

    if (savedUser && savedProfiles && savedProfiles.length > 0) {
      setUser(savedUser);
      const profile = savedProfiles.find((p) => p.id === savedUser.activeProfileId);
      setActiveProfileState(profile || savedProfiles[0]);
    } else {
      // Create default user and profile
      const defaultUser = createDefaultUser();
      const defaultProfile = defaultUser.profiles[0];
      defaultUser.activeProfileId = defaultProfile.id;

      saveToStorage('user', defaultUser);
      saveToStorage('profiles', [defaultProfile]);

      setUser(defaultUser);
      setActiveProfileState(defaultProfile);
    }

    setIsLoading(false);
  }, []);

  const setActiveProfile = (profileId: string) => {
    if (!user) return;

    const profile = user.profiles.find((p) => p.id === profileId);
    if (profile) {
      const updatedUser = { ...user, activeProfileId: profileId };
      setUser(updatedUser);
      setActiveProfileState(profile);
      saveToStorage('user', updatedUser);
    }
  };

  const createProfile = (name: string): Profile => {
    if (!user) {
      const defaultUser = createDefaultUser();
      setUser(defaultUser);
      return defaultUser.profiles[0];
    }

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name,
      sensitivity: 'medium',
      preferredActivities: ['walking'],
      language: 'en',
      accessibilityMode: 'normal',
      createdAt: new Date().toISOString(),
    };

    const updatedProfiles = [...user.profiles, newProfile];
    const updatedUser = { ...user, profiles: updatedProfiles };

    setUser(updatedUser);
    saveToStorage('user', updatedUser);
    saveToStorage('profiles', updatedProfiles);

    return newProfile;
  };

  const updateProfile = (updatedProfile: Profile) => {
    if (!user) return;

    const updatedProfiles = user.profiles.map((p) =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    const updatedUser = { ...user, profiles: updatedProfiles };

    setUser(updatedUser);
    if (updatedProfile.id === user.activeProfileId) {
      setActiveProfileState(updatedProfile);
    }

    saveToStorage('user', updatedUser);
    saveToStorage('profiles', updatedProfiles);
  };

  const deleteProfile = (profileId: string) => {
    if (!user || user.profiles.length <= 1) return;

    const updatedProfiles = user.profiles.filter((p) => p.id !== profileId);
    const newActiveId =
      user.activeProfileId === profileId ? updatedProfiles[0].id : user.activeProfileId;

    const updatedUser = {
      ...user,
      profiles: updatedProfiles,
      activeProfileId: newActiveId,
    };

    setUser(updatedUser);
    const newActive = updatedProfiles.find((p) => p.id === newActiveId);
    if (newActive) {
      setActiveProfileState(newActive);
    }

    saveToStorage('user', updatedUser);
    saveToStorage('profiles', updatedProfiles);
  };

  const setEntitlementLevel = (level: EntitlementLevel) => {
    if (!user) return;

    const updatedUser = { ...user, entitlementLevel: level };
    setUser(updatedUser);
    saveToStorage('user', updatedUser);
  };

  const addFamilyMember = (name: string, relation: string) => {
    if (!user) return;

    const newMember = {
      id: `member-${Date.now()}`,
      name,
      relation,
      joinedAt: new Date().toISOString(),
    };

    const updatedFamilyMembers = [...(user.familyMembers || []), newMember];
    const updatedUser = { ...user, familyMembers: updatedFamilyMembers };

    setUser(updatedUser);
    saveToStorage('user', updatedUser);
  };

  const removeFamilyMember = (memberId: string) => {
    if (!user) return;

    const updatedFamilyMembers = (user.familyMembers || []).filter(
      (m) => m.id !== memberId
    );
    const updatedUser = { ...user, familyMembers: updatedFamilyMembers };

    setUser(updatedUser);
    saveToStorage('user', updatedUser);
  };

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        profiles: user?.profiles || [],
        user,
        isLoading,
        setActiveProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        setEntitlementLevel,
        addFamilyMember,
        removeFamilyMember,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
