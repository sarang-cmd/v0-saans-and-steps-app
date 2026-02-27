'use client';

import React from 'react';
import { AirQualityData } from '@/lib/types';
import { AQIIndicator, OptimalWindowBadge } from './SvgIllustrations';
import { cn } from '@/lib/utils';

interface AQICardProps {
  data: AirQualityData | null;
  isLoading?: boolean;
  locationName?: string;
}

export const AQICard: React.FC<AQICardProps> = ({ data, isLoading, locationName }) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-24 bg-muted rounded mb-4" />
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <p className="text-foreground/60 text-center py-8">No air quality data available</p>
      </div>
    );
  }

  const getAQIColor = (category: string) => {
    const colors: Record<string, string> = {
      'good': 'text-green-600 dark:text-green-400',
      'satisfactory': 'text-emerald-600 dark:text-emerald-400',
      'moderately-polluted': 'text-yellow-600 dark:text-yellow-400',
      'poor': 'text-orange-600 dark:text-orange-400',
      'very-poor': 'text-red-600 dark:text-red-400',
      'severe': 'text-red-700 dark:text-red-300',
    };
    return colors[category] || colors['good'];
  };

  const getAQIBgColor = (category: string) => {
    const colors: Record<string, string> = {
      'good': 'bg-green-50 dark:bg-green-900/20',
      'satisfactory': 'bg-emerald-50 dark:bg-emerald-900/20',
      'moderately-polluted': 'bg-yellow-50 dark:bg-yellow-900/20',
      'poor': 'bg-orange-50 dark:bg-orange-900/20',
      'very-poor': 'bg-red-50 dark:bg-red-900/20',
      'severe': 'bg-red-100 dark:bg-red-900/30',
    };
    return colors[category] || colors['good'];
  };

  return (
    <div className={cn('rounded-2xl p-6 border border-border', getAQIBgColor(data.aqiCategory))}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Air Quality Index</p>
          {locationName && (
            <h3 className="text-xl font-bold text-foreground mt-1">{locationName}</h3>
          )}
        </div>
        <AQIIndicator category={data.aqiCategory} />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-4">
          <span className={cn('text-6xl font-bold', getAQIColor(data.aqiCategory))}>
            {Math.round(data.aqi)}
          </span>
          <span className="text-lg text-foreground/70">AQI</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">PM2.5</p>
            <p className="text-lg font-semibold text-foreground">{data.pm25.toFixed(1)} μg/m³</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">PM10</p>
            <p className="text-lg font-semibold text-foreground">{data.pm10.toFixed(1)} μg/m³</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {data.aqiCategory === 'good' || data.aqiCategory === 'satisfactory' ? (
          <>
            <OptimalWindowBadge />
            <p className="text-sm text-foreground/80">
              {data.aqiCategory === 'good'
                ? 'Excellent conditions for outdoor workouts!'
                : 'Good conditions for most outdoor activities.'}
            </p>
          </>
        ) : (
          <p className="text-sm text-foreground/80">
            {data.aqiCategory === 'moderately-polluted'
              ? 'Consider lighter activities or wearing a mask.'
              : data.aqiCategory === 'poor'
                ? 'Limit outdoor activities. Vulnerable groups should stay indoors.'
                : 'Stay indoors and avoid outdoor activities.'}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
        <p>Updated: {new Date(data.timestamp).toLocaleTimeString()}</p>
        {data.dataSource === 'demo' && (
          <p className="text-warning">Demo data - Real data not available</p>
        )}
      </div>
    </div>
  );
};
