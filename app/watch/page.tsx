'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/contexts/ProfileContext';
import { useData } from '@/contexts/DataContext';
import { PlacesManager } from '@/lib/places';
import { ENTITLEMENTS, Place } from '@/lib/types';
import { AQIIndicator } from '@/components/SvgIllustrations';
import { cn } from '@/lib/utils';

export default function WatchPage() {
  const { user } = useProfile();
  const { airQualityData, fetchAirQuality, weatherData, fetchWeather } = useData();

  const [watchPlaces, setWatchPlaces] = useState<Place[]>([]);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);

  const entitlements = user ? ENTITLEMENTS[user.entitlementLevel] : ENTITLEMENTS.free;
  const canAddMore = watchPlaces.length < entitlements.watchPlacesLimit;

  // Initialize with some default places
  useEffect(() => {
    if (watchPlaces.length === 0) {
      const defaultPlaces = PlacesManager.getAllIndianCities().slice(0, 3);
      setWatchPlaces(defaultPlaces);

      // Fetch data for default places
      defaultPlaces.forEach((place) => {
        fetchAirQuality(place);
        fetchWeather(place);
      });
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const results = PlacesManager.searchPlaces(query, true);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddPlace = (place: Place) => {
    if (watchPlaces.find((p) => p.id === place.id)) {
      // Already added
      return;
    }

    if (watchPlaces.length < entitlements.watchPlacesLimit) {
      setWatchPlaces([...watchPlaces, place]);
      fetchAirQuality(place);
      fetchWeather(place);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemovePlace = (placeId: string) => {
    setWatchPlaces(watchPlaces.filter((p) => p.id !== placeId));
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { status: 'Good', color: 'text-green-600 dark:text-green-400' };
    if (aqi <= 100) return { status: 'Satisfactory', color: 'text-emerald-600 dark:text-emerald-400' };
    if (aqi <= 150) return { status: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    if (aqi <= 200) return { status: 'Poor', color: 'text-orange-600 dark:text-orange-400' };
    if (aqi <= 300) return { status: 'Very Poor', color: 'text-red-600 dark:text-red-400' };
    return { status: 'Severe', color: 'text-red-700 dark:text-red-300' };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Watch Multiple Cities</h1>
              <p className="text-foreground/70 text-sm mt-1">Monitor air quality across your favorite locations</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/">Back to Today</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Entitlement Info */}
        <Card className="mb-8 border-secondary/20 bg-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Watching {watchPlaces.length} of {entitlements.watchPlacesLimit} cities
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  {entitlements.watchPlacesLimit === 3
                    ? 'Upgrade to Pro to monitor more cities'
                    : ''}
                </p>
              </div>
              {canAddMore ? (
                <Button
                  onClick={() => setShowAddPlace(!showAddPlace)}
                  size="sm"
                  variant="default"
                >
                  + Add City
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <a href="/#upgrade">Upgrade to Add More</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Place Section */}
        {showAddPlace && canAddMore && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add a City to Watch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search cities... (e.g., Mumbai, Bangalore)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => handleAddPlace(place)}
                        disabled={watchPlaces.some((p) => p.id === place.id)}
                        className={cn(
                          'w-full p-3 rounded-lg border border-border text-left transition-all',
                          watchPlaces.some((p) => p.id === place.id)
                            ? 'opacity-50 cursor-not-allowed bg-foreground/5'
                            : 'hover:border-primary/50 hover:bg-foreground/5'
                        )}
                      >
                        <p className="font-medium text-foreground">{place.name}</p>
                        <p className="text-xs text-foreground/60">{place.state}</p>
                        {watchPlaces.some((p) => p.id === place.id) && (
                          <p className="text-xs text-primary font-semibold mt-1">Already added</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <p className="text-sm text-foreground/60 text-center py-4">No cities found</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watched Cities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchPlaces.map((place) => {
            const aqKey = `aq-${place.id}`;
            const weatherKey = `weather-${place.id}`;
            const aqData = airQualityData[aqKey];
            const weatherData_ = weatherData[weatherKey];

            const aqi = aqData?.aqi || 0;
            const aqiStatus = getAQIStatus(aqi);
            const temp = weatherData_?.temperature || 'N/A';
            const condition = weatherData_?.weatherDescription || 'Unknown';

            return (
              <Card
                key={place.id}
                className="overflow-hidden hover:shadow-lg transition-all border-2 border-border"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{place.name}</CardTitle>
                      <CardDescription className="text-xs">{place.state}</CardDescription>
                    </div>
                    <button
                      onClick={() => handleRemovePlace(place.id)}
                      className="px-2 py-1 rounded hover:bg-destructive/10 text-destructive"
                      title="Remove from watch"
                    >
                      ✕
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* AQI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-foreground/70">Air Quality Index</p>
                      <p className={cn('text-2xl font-bold', aqiStatus.color)}>
                        {Math.round(aqi)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AQIIndicator category={aqData?.aqiCategory || 'good'} />
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="pt-3 border-t border-border/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground/70">Temperature</p>
                      <p className="font-semibold text-foreground">
                        {typeof temp === 'number' ? `${temp.toFixed(0)}°C` : temp}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground/70">Condition</p>
                      <p className="text-sm font-medium text-foreground">{condition}</p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-foreground/70 mb-2">Recommendation</p>
                    <p className="text-sm text-foreground/80">
                      {aqi <= 100
                        ? '✓ Good for outdoor activities'
                        : aqi <= 150
                          ? 'Consider lighter activities'
                          : 'Prefer indoor workouts'}
                    </p>
                  </div>

                  {/* Quick Action */}
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={`/#place=${place.id}`}>View Details</a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {watchPlaces.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-foreground/70 mb-4">No cities being watched</p>
              <Button onClick={() => setShowAddPlace(true)}>Add a City</Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Watch</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80 space-y-3">
            <p>
              Monitor real-time air quality and weather data from multiple Indian cities all in one place.
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Free plan:</strong> Watch up to 3 cities</li>
              <li>• <strong>Pro plan:</strong> Watch up to 15 cities</li>
              <li>• <strong>Data updates:</strong> Every 30 minutes</li>
              <li>• <strong>Notifications:</strong> Get alerts for sudden AQI changes</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
