'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/contexts/ProfileContext';
import { useData } from '@/contexts/DataContext';
import { PlacesManager } from '@/lib/places';
import { ScoringEngine } from '@/lib/scoring';
import { Place } from '@/lib/types';

export default function PlannerPage() {
  const { activeProfile } = useProfile();
  const { fetchAirQuality, fetchWeather, airQualityData, weatherData } = useData();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [days, setDays] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePlanner = async () => {
      if (!activeProfile) return;

      const delhiCity = PlacesManager.getAllIndianCities().find((city) => city.name === 'Delhi');
      if (delhiCity) {
        setSelectedPlace(delhiCity);

        // Simulate 7-day forecast (in real app, would fetch historical + forecast data)
        const sevenDays = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);

          // Simulate different AQI for each day
          const variationFactor = Math.sin(i) * 0.3 + 1;
          const avgAQI = Math.round(50 * variationFactor);
          const avgTemp = 25 + Math.sin(i * 0.5) * 5;
          const avgWindSpeed = 10 + Math.random() * 5;

          const score = activeProfile ? ScoringEngine.calculate7DayOutlook(
            [{ date: date.toISOString().split('T')[0], avgAQI, avgTemp, avgWindSpeed }],
            activeProfile
          )[0] : null;

          sevenDays.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            avgAQI,
            avgTemp,
            avgWindSpeed,
            score: score?.score || 0,
            recommendation: score?.recommendation || 'Check back for details',
            isToday: i === 0,
          });
        }

        setDays(sevenDays);
      }

      setIsLoading(false);
    };

    initializePlanner();
  }, [activeProfile, fetchAirQuality, fetchWeather]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' };
    if (score >= 70) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    if (score >= 60) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' };
    return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading 7-day planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">7-Day Planner</h1>
              <p className="text-foreground/70 text-sm mt-1">Plan your workouts for the week ahead</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/">Back to Today</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Location Info */}
        {selectedPlace && (
          <div className="mb-6">
            <p className="text-sm text-foreground/70">📍 Viewing forecast for: <span className="font-semibold text-foreground">{selectedPlace.name}</span></p>
          </div>
        )}

        {/* 7-Day Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:max-h-96 lg:grid-rows-2 mb-8">
          {days.map((day, idx) => {
            const colors = getScoreColor(day.score);

            return (
              <Card
                key={idx}
                className={`transition-all hover:shadow-md cursor-pointer border-2 ${
                  day.isToday
                    ? `border-primary ${colors.bg}`
                    : `border-border ${colors.bg}`
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{day.dayName}</CardTitle>
                      <CardDescription className="text-xs">{day.fullDate}</CardDescription>
                    </div>
                    {day.isToday && (
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                        TODAY
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Score */}
                  <div>
                    <p className="text-xs text-foreground/70 mb-1">Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${colors.text}`}>{day.score}</span>
                      <span className="text-xs text-foreground/70">/100</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                    <div>
                      <p className="text-xs text-foreground/70">AQI</p>
                      <p className="font-semibold text-foreground">{day.avgAQI}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/70">Temp</p>
                      <p className="font-semibold text-foreground">{day.avgTemp.toFixed(0)}°C</p>
                    </div>
                  </div>

                  {/* Recommendation snippet */}
                  <div className="text-xs text-foreground/75 bg-foreground/5 p-2 rounded">
                    {day.recommendation.substring(0, 50)}...
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed 7-Day View */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
            <CardDescription>Detailed air quality and workout suitability forecast</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {days.map((day, idx) => {
                const colors = getScoreColor(day.score);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {day.dayName} • {day.fullDate}
                        </h3>
                        {day.isToday && (
                          <p className="text-xs text-primary font-semibold mt-1">TODAY</p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className={`text-2xl font-bold ${colors.text}`}>{day.score}</p>
                        <p className="text-xs text-foreground/60">score</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-3 pb-3 border-b border-border/30">
                      <div>
                        <p className="text-xs text-foreground/70 mb-1">Air Quality</p>
                        <p className="text-xl font-bold text-foreground">{day.avgAQI}</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {day.avgAQI <= 50 ? 'Good' : day.avgAQI <= 100 ? 'Satisfactory' : 'Moderate'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-foreground/70 mb-1">Temperature</p>
                        <p className="text-xl font-bold text-foreground">{day.avgTemp.toFixed(1)}°C</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {day.avgTemp < 10 ? 'Cold' : day.avgTemp > 30 ? 'Warm' : 'Comfortable'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-foreground/70 mb-1">Wind Speed</p>
                        <p className="text-xl font-bold text-foreground">{day.avgWindSpeed.toFixed(1)} km/h</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          {day.avgWindSpeed < 10 ? 'Light' : day.avgWindSpeed > 20 ? 'Moderate' : 'Gentle'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-foreground/80">
                        <strong>Recommendation:</strong> {day.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Planning Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Planning Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="text-lg">🏃</span>
                <div>
                  <strong>Peak Days:</strong> Schedule intense workouts on days with scores above 75 when air quality and weather are optimal.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">🚶</span>
                <div>
                  <strong>Active Days:</strong> On moderate score days (60-75), opt for low-impact activities or shorter workout durations.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">🏠</span>
                <div>
                  <strong>Rest Days:</strong> Days with scores below 60 are ideal for indoor workouts or rest to protect your health.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">📱</span>
                <div>
                  <strong>Notifications:</strong> Enable notifications to get alerts when optimal windows appear in your area.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
