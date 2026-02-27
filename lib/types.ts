// User & Profile Types
export interface Profile {
  id: string;
  name: string;
  age?: number;
  sensitivity: 'low' | 'medium' | 'high';
  preferredActivities: string[];
  language: 'en' | 'hi';
  accessibilityMode: 'normal' | 'senior-friendly';
  createdAt: string;
}

export interface User {
  activeProfileId: string;
  profiles: Profile[];
  entitlementLevel: EntitlementLevel;
  familyMembers?: FamilyMember[];
  watchPlaces: Place[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  autoNotifications: boolean;
  notificationTime?: string;
  useMetricUnits: boolean;
}

// Place & Location Types
export interface Place {
  id: string;
  name: string;
  type: 'city' | 'ncr-area' | 'custom';
  latitude: number;
  longitude: number;
  state?: string;
  country: string;
  addedAt: string;
}

export interface IndianCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Air Quality Types
export interface AirQualityData {
  placeId: string;
  timestamp: string;
  pm25: number;
  pm10: number;
  aqi: number;
  aqiCategory: AQICategory;
  dataSource: 'openaq' | 'demo';
  hourlyTrend?: HourlyAQIPoint[];
}

export type AQICategory = 'good' | 'satisfactory' | 'moderately-polluted' | 'poor' | 'very-poor' | 'severe';

export interface HourlyAQIPoint {
  hour: number;
  pm25: number;
  aqi: number;
  category: AQICategory;
  isOptimal: boolean;
}

// Weather Types
export interface WeatherData {
  placeId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  uvIndex?: number;
  feelsLike?: number;
  hourlyForecast?: HourlyWeatherPoint[];
}

export interface HourlyWeatherPoint {
  hour: number;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

// Scoring & Workout Window Types
export interface ScoreWindow {
  placeId: string;
  startHour: number;
  endHour: number;
  date: string;
  airQualityScore: number;
  weatherScore: number;
  overallScore: number;
  recommendation: string;
  suitableActivities: string[];
}

export interface WorkoutSession {
  id: string;
  profileId: string;
  placeId: string;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  duration: number;
  notes?: string;
  aqi: number;
  completed: boolean;
}

// Family & Social Types
export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  profileId?: string;
  shareCode?: string;
  joinedAt: string;
}

export interface FamilyCheckIn {
  memberId: string;
  timestamp: string;
  location: Place;
  aqi: number;
  status: 'safe' | 'caution' | 'warning';
}

// Entitlement & Monetization Types
export type EntitlementLevel = 'free' | 'no-ads' | 'pro' | 'max';

export interface EntitlementFeatures {
  level: EntitlementLevel;
  watchPlacesLimit: number;
  familyMembersLimit: number;
  themes: boolean;
  exportData: boolean;
  familyCheckIns: boolean;
  automationRules: boolean;
  cameraGrid: boolean;
  backendKit: boolean;
}

export const ENTITLEMENTS: Record<EntitlementLevel, EntitlementFeatures> = {
  free: {
    level: 'free',
    watchPlacesLimit: 3,
    familyMembersLimit: 0,
    themes: false,
    exportData: false,
    familyCheckIns: false,
    automationRules: false,
    cameraGrid: false,
    backendKit: false,
  },
  'no-ads': {
    level: 'no-ads',
    watchPlacesLimit: 5,
    familyMembersLimit: 0,
    themes: false,
    exportData: false,
    familyCheckIns: false,
    automationRules: false,
    cameraGrid: false,
    backendKit: false,
  },
  pro: {
    level: 'pro',
    watchPlacesLimit: 15,
    familyMembersLimit: 5,
    themes: true,
    exportData: true,
    familyCheckIns: true,
    automationRules: false,
    cameraGrid: false,
    backendKit: false,
  },
  max: {
    level: 'max',
    watchPlacesLimit: 15,
    familyMembersLimit: 10,
    themes: true,
    exportData: true,
    familyCheckIns: true,
    automationRules: true,
    cameraGrid: true,
    backendKit: true,
  },
};

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Onboarding Types
export type OnboardingMode = 'guided' | 'detailed' | 'skip';

export interface OnboardingState {
  completed: boolean;
  mode: OnboardingMode;
  step: number;
  startedAt: string;
}
