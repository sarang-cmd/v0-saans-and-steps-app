'use client';

import React from 'react';
import { WeatherData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WeatherSummaryProps {
  data: WeatherData | null;
  isLoading?: boolean;
}

export const WeatherSummary: React.FC<WeatherSummaryProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg p-4 border border-border animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const weatherMetrics = [
    {
      label: 'Temperature',
      value: `${data.temperature.toFixed(0)}°C`,
      description: data.feelsLike ? `Feels like ${data.feelsLike}°C` : '',
      icon: '🌡️',
    },
    {
      label: 'Humidity',
      value: `${Math.round(data.humidity)}%`,
      icon: '💧',
    },
    {
      label: 'Wind Speed',
      value: `${data.windSpeed.toFixed(1)} km/h`,
      icon: '💨',
    },
    {
      label: 'Conditions',
      value: data.weatherDescription,
      icon: '🌤️',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {weatherMetrics.map((metric, idx) => (
        <div
          key={idx}
          className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{metric.icon}</span>
            <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
          </div>
          <p className="text-lg font-bold text-foreground">{metric.value}</p>
          {metric.description && (
            <p className="text-xs text-foreground/60 mt-1">{metric.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

interface HourlyWeatherChartProps {
  data: WeatherData | null;
  isLoading?: boolean;
}

export const HourlyWeatherChart: React.FC<HourlyWeatherChartProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading || !data?.hourlyForecast) {
    return null;
  }

  const currentHour = new Date().getHours();
  const forecast = data.hourlyForecast.slice(0, 12);

  const minTemp = Math.min(...forecast.map((f) => f.temperature));
  const maxTemp = Math.max(...forecast.map((f) => f.temperature));
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4">12-Hour Temperature Trend</h3>

      <div className="flex items-end gap-2 h-32">
        {forecast.map((point, idx) => {
          const height = ((point.temperature - minTemp) / tempRange) * 100 + 20;
          const isNow = point.hour === currentHour;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 min-w-0"
            >
              <div className="flex flex-col items-center">
                <p className={cn(
                  'text-xs font-semibold',
                  isNow ? 'text-primary font-bold' : 'text-foreground/70'
                )}>
                  {point.temperature.toFixed(0)}°
                </p>
              </div>

              <div
                className={cn(
                  'w-full rounded-t-lg transition-all',
                  isNow
                    ? 'bg-primary shadow-lg'
                    : 'bg-accent hover:bg-accent/80'
                )}
                style={{ height: `${height}%` }}
              />

              <p className="text-xs text-foreground/60 text-center min-w-max">
                {point.hour % 2 === 0 ? `${point.hour}:00` : ''}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
        <p>Current hour marked in {' '}
          <span className="inline-block w-3 h-3 bg-primary rounded-sm align-text-bottom" />
        </p>
      </div>
    </div>
  );
};
