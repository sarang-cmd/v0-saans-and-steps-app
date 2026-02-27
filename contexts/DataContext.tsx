'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { AirQualityData, WeatherData, ScoreWindow, Place } from '@/lib/types';
import { openaqClient } from '@/lib/api/openaq';
import { metWeatherClient } from '@/lib/api/metweather';
import { ScoringEngine } from '@/lib/scoring';
import { useProfile } from './ProfileContext';

interface DataContextType {
  // Air Quality
  airQualityData: Record<string, AirQualityData | null>;
  fetchAirQuality: (place: Place) => Promise<AirQualityData | null>;
  
  // Weather
  weatherData: Record<string, WeatherData | null>;
  fetchWeather: (place: Place) => Promise<WeatherData | null>;
  
  // Scoring & Windows
  optimalWindows: Record<string, ScoreWindow[]>;
  calculateOptimalWindows: (place: Place) => Promise<ScoreWindow[]>;
  
  // Loading & Errors
  isLoading: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // Refresh all data for a place
  refreshPlaceData: (place: Place) => Promise<void>;
  clearCache: (placeId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProfile } = useProfile();
  
  const [airQualityData, setAirQualityData] = useState<Record<string, AirQualityData | null>>({});
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData | null>>({});
  const [optimalWindows, setOptimalWindows] = useState<Record<string, ScoreWindow[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const fetchAirQuality = useCallback(
    async (place: Place): Promise<AirQualityData | null> => {
      const key = `aq-${place.id}`;
      
      // Return cached if available
      if (airQualityData[key]) {
        return airQualityData[key];
      }

      try {
        setIsLoading((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: null }));

        const data = await openaqClient.getAirQualityData(
          place.id,
          place.latitude,
          place.longitude
        );

        if (data) {
          data.placeId = place.id;
          setAirQualityData((prev) => ({ ...prev, [key]: data }));
        }

        return data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch air quality data';
        setErrors((prev) => ({ ...prev, [key]: errorMsg }));
        return null;
      } finally {
        setIsLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [airQualityData]
  );

  const fetchWeather = useCallback(
    async (place: Place): Promise<WeatherData | null> => {
      const key = `weather-${place.id}`;
      
      // Return cached if available
      if (weatherData[key]) {
        return weatherData[key];
      }

      try {
        setIsLoading((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: null }));

        const data = await metWeatherClient.getWeatherData(
          place.id,
          place.latitude,
          place.longitude
        );

        if (data) {
          setWeatherData((prev) => ({ ...prev, [key]: data }));
        }

        return data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch weather data';
        setErrors((prev) => ({ ...prev, [key]: errorMsg }));
        return null;
      } finally {
        setIsLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [weatherData]
  );

  const calculateOptimalWindows = useCallback(
    async (place: Place): Promise<ScoreWindow[]> => {
      if (!activeProfile) {
        return [];
      }

      const key = `windows-${place.id}`;
      
      // Return cached if available
      if (optimalWindows[key] && optimalWindows[key].length > 0) {
        return optimalWindows[key];
      }

      try {
        setIsLoading((prev) => ({ ...prev, [key]: true }));
        
        const aq = await fetchAirQuality(place);
        const weather = await fetchWeather(place);

        if (!aq || !weather) {
          return [];
        }

        const windows = ScoringEngine.findOptimalWindows(aq, weather, activeProfile);
        setOptimalWindows((prev) => ({ ...prev, [key]: windows }));

        return windows;
      } finally {
        setIsLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [activeProfile, fetchAirQuality, fetchWeather]
  );

  const refreshPlaceData = useCallback(
    async (place: Place): Promise<void> => {
      // Clear cached data
      clearCache(place.id);
      
      // Fetch fresh data
      await fetchAirQuality(place);
      await fetchWeather(place);
      await calculateOptimalWindows(place);
    },
    [fetchAirQuality, fetchWeather, calculateOptimalWindows]
  );

  const clearCache = useCallback((placeId: string) => {
    setAirQualityData((prev) => {
      const newData = { ...prev };
      delete newData[`aq-${placeId}`];
      return newData;
    });
    setWeatherData((prev) => {
      const newData = { ...prev };
      delete newData[`weather-${placeId}`];
      return newData;
    });
    setOptimalWindows((prev) => {
      const newData = { ...prev };
      delete newData[`windows-${placeId}`];
      return newData;
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        airQualityData,
        fetchAirQuality,
        weatherData,
        fetchWeather,
        optimalWindows,
        calculateOptimalWindows,
        isLoading,
        errors,
        refreshPlaceData,
        clearCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
