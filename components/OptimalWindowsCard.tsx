'use client';

import React from 'react';
import { ScoreWindow } from '@/lib/types';
import { ActivityIcon } from './SvgIllustrations';
import { cn } from '@/lib/utils';

interface OptimalWindowsCardProps {
  windows: ScoreWindow[];
  isLoading?: boolean;
}

export const OptimalWindowsCard: React.FC<OptimalWindowsCardProps> = ({ windows, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!windows || windows.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Optimal Workout Windows</h3>
        <p className="text-foreground/60 text-sm py-8 text-center">
          No optimal windows found today. Check back later!
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Optimal Workout Windows</h3>

      <div className="space-y-3">
        {windows.map((window, idx) => (
          <div
            key={idx}
            className={cn(
              'p-4 rounded-lg border border-border/50 transition-all hover:shadow-md',
              getScoreColor(window.overallScore)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    {formatHour(window.startHour)}
                  </p>
                  <p className="text-xs text-foreground/70">
                    - {formatHour(Math.min(window.endHour, 23))}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{window.overallScore}</p>
                <p className="text-xs text-foreground/70">score</p>
              </div>
            </div>

            <p className="text-sm text-foreground/80 mb-3">{window.recommendation}</p>

            {window.suitableActivities && window.suitableActivities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {window.suitableActivities.slice(0, 3).map((activity) => (
                  <div
                    key={activity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-foreground/5 rounded text-xs font-medium text-foreground/70"
                  >
                    <ActivityIcon type={activity as any} className="w-3 h-3" />
                    {activity.replace('-', ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Scores based on air quality, temperature, humidity, and wind conditions.
        </p>
      </div>
    </div>
  );
};
