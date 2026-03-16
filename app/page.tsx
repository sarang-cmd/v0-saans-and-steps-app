'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TricolorWaveHeader, AshokaChakraWatermark, DelhiSkylineLineArt } from '@/components/SvgIllustrations';
import { AQICard } from '@/components/AQICard';
import { OptimalWindowsCard } from '@/components/OptimalWindowsCard';
import { WeatherSummary, HourlyWeatherChart } from '@/components/WeatherSummary';
import { GlassCard } from '@/components/GlassCard';
import { useProfile } from '@/contexts/ProfileContext';
import { useData } from '@/contexts/DataContext';
import { PlacesManager } from '@/lib/places';
import { Place } from '@/lib/types';

export default function HomePage() {
  const { activeProfile, user, isLoading: profileLoading } = useProfile();
  const { airQualityData, weatherData, optimalWindows, fetchAirQuality, fetchWeather, calculateOptimalWindows, isLoading, errors } = useData();
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with Delhi as default
  useEffect(() => {
    if (!isInitialized && activeProfile) {
      const delhiCity = PlacesManager.getAllIndianCities().find(
        (city) => city.name === 'Delhi'
      );

      if (delhiCity) {
        setSelectedPlace(delhiCity);
        setIsInitialized(true);

        // Fetch data for Delhi
        fetchAirQuality(delhiCity);
        fetchWeather(delhiCity);
        calculateOptimalWindows(delhiCity);
      }
    }
  }, [activeProfile, isInitialized, fetchAirQuality, fetchWeather, calculateOptimalWindows]);

  const getAQDataForPlace = () => {
    if (!selectedPlace) return null;
    return airQualityData[`aq-${selectedPlace.id}`] || null;
  };

  const getWeatherDataForPlace = () => {
    if (!selectedPlace) return null;
    return weatherData[`weather-${selectedPlace.id}`] || null;
  };

  const getWindowsForPlace = () => {
    if (!selectedPlace) return [];
    return optimalWindows[`windows-${selectedPlace.id}`] || [];
  };

  const isLoadingPlace = selectedPlace ? (isLoading[`aq-${selectedPlace.id}`] || false) : false;
  const isLoadingWeather = selectedPlace ? (isLoading[`weather-${selectedPlace.id}`] || false) : false;
  const isLoadingWindows = selectedPlace ? (isLoading[`windows-${selectedPlace.id}`] || false) : false;

  const aqData = getAQDataForPlace();
  const weatherDataPoint = getWeatherDataForPlace();
  const windows = getWindowsForPlace();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" 
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading your profile...</span>
          </div>
          <p className="text-foreground/70">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Tricolor Wave */}
      <header className="relative border-b border-border">
        <TricolorWaveHeader />
        <AshokaChakraWatermark opacity={0.07} />
        <div className="px-4 md:px-6 py-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Saans & Steps</h1>
                <p className="text-foreground/70 mt-1">
                  {activeProfile?.name || 'My Profile'} • {selectedPlace?.name || 'Select location'}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/profile">Settings</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Place Selector */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-foreground">📍 Your Location</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {PlacesManager.getAllIndianCities()
                .slice(0, 12)
                .map((place) => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      fetchAirQuality(place);
                      fetchWeather(place);
                      calculateOptimalWindows(place);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedPlace?.id === place.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-card border border-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {place.name}
                  </button>
                ))}
            </div>
          </div>

          {/* AQI Card - Hero Section */}
          <div className="mb-8">
            <AQICard
              data={aqData}
              isLoading={isLoadingPlace}
              locationName={selectedPlace?.name}
            />
          </div>

          {/* Weather Summary */}
          <WeatherSummary data={weatherDataPoint} isLoading={isLoadingWeather} />

          {/* Grid Layout for content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Optimal Workout Windows */}
            <div>
              <OptimalWindowsCard windows={windows} isLoading={isLoadingWindows} />
            </div>

            {/* Weather Chart */}
            <div>
              <HourlyWeatherChart data={weatherDataPoint} isLoading={isLoadingWeather} />
            </div>
          </div>

          {/* Air Quality 24-Hour Trend */}
          {aqData?.hourlyTrend && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <h3 className="font-semibold text-foreground mb-4">24-Hour Air Quality Trend</h3>

              <div className="relative h-40">
                <div className="absolute inset-0 flex items-end gap-1">
                  {aqData.hourlyTrend.map((point, idx) => {
                    const allAqi = aqData.hourlyTrend!.map((p) => p.aqi);
                    const minAqi = Math.min(...allAqi);
                    const maxAqi = Math.max(...allAqi);
                    const range = maxAqi - minAqi || 1;
                    const heightPct = Math.max(15, Math.round(((point.aqi - minAqi) / range) * 75 + 15));
                    const isOptimal = point.isOptimal;
                    const barColor = point.category === 'good'
                      ? 'bg-green-500'
                      : point.category === 'satisfactory'
                        ? 'bg-emerald-400'
                        : point.category === 'moderately-polluted'
                          ? 'bg-yellow-400'
                          : point.category === 'poor'
                            ? 'bg-orange-400'
                            : 'bg-red-500';

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                          <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap">
                            {point.hour}:00 — AQI {point.aqi}
                          </div>
                          <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
                        </div>

                        {isOptimal && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}

                        <div
                          className={`w-full rounded-t-sm transition-all ${barColor} ${isOptimal ? 'ring-1 ring-green-400' : ''}`}
                          style={{ height: `${heightPct}%` }}
                        />

                        <p className="text-xs text-foreground/50 leading-none whitespace-nowrap">
                          {point.hour % 4 === 0 ? `${point.hour}h` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Good</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-400" /> Satisfactory</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-yellow-400" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-orange-400" /> Poor</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Optimal workout hour</span>
              </div>
            </div>
          )}

          {/* Suggestions & Tips */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              💡 Health Tips
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>
                • <strong>Morning vs Evening:</strong> Early morning (6-8 AM) typically has better air quality than evening.
              </li>
              <li>
                • <strong>Sensitivity:</strong> If you have respiratory issues, prioritize workouts during "Satisfactory" or "Good" AQI hours.
              </li>
              <li>
                • <strong>Hydration:</strong> During higher temperatures, increase your water intake before, during, and after exercise.
              </li>
              <li>
                • <strong>Protection:</strong> Consider wearing an N95 mask if AQI exceeds 150, especially for outdoor workouts.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-sm text-foreground/70">
            <div>
              <p className="font-semibold text-foreground mb-2">About</p>
              <p>Saans & Steps helps you breathe better and stay active with real-time air quality and personalized workout recommendations.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Data Sources</p>
              <p>Air Quality: OpenAQ • Weather: MET Norway • Data updated every 30 minutes</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Disclaimer</p>
              <p>Always consult healthcare providers for respiratory concerns. This app provides information, not medical advice.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
