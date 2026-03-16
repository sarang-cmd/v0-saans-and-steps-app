import { AirQualityData, HourlyAQIPoint, AQICategory } from '../types';
import { StorageCache } from '../storage';

export class OpenAQClient {
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // Cache for 30 minutes
  private readonly RATE_LIMIT_MS = 5000; // 5 second rate limit per location
  private lastFetchTime: { [key: string]: number } = {};

  /**
   * Get Air Quality data for a location using real OpenAQ API
   * Falls back to demo data if API fails
   */
  async getAirQualityData(
    placeId: string,
    latitude: number,
    longitude: number,
    useCache = true
  ): Promise<AirQualityData | null> {
    // Check cache first
    if (useCache) {
      const cached = StorageCache.getAirQualityCache(placeId);
      if (cached) {
        console.log('[v0] OpenAQ: Using cached data for', placeId);
        return cached;
      }
    }

    // Check rate limit
    const now = Date.now();
    const lastFetch = this.lastFetchTime[placeId] || 0;
    if (now - lastFetch < this.RATE_LIMIT_MS) {
      console.log('[v0] OpenAQ: Rate limited, using demo data for', placeId);
      const demoData = this.generateDemoData(placeId, latitude, longitude);
      return demoData;
    }

    try {
      console.log('[v0] OpenAQ: Fetching real data for', placeId);
      this.lastFetchTime[placeId] = now;

      // Call our backend proxy route which handles authentication
      const response = await fetch(
        `/api/air-quality?lat=${latitude}&lng=${longitude}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        console.warn('[v0] OpenAQ: Proxy returned', response.status, '— using demo data');
        const demoData = this.generateDemoData(placeId, latitude, longitude);
        StorageCache.setAirQualityCache(placeId, demoData);
        return demoData;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        console.warn('[v0] OpenAQ: No data in response —', data.error);
        const demoData = this.generateDemoData(placeId, latitude, longitude);
        StorageCache.setAirQualityCache(placeId, demoData);
        return demoData;
      }

      // Build real AQI data from API response
      const pm25 = data.data.pm25 || 0;
      const pm10 = data.data.pm10 || 0;

      const realData: AirQualityData = {
        placeId,
        timestamp: data.data.timestamp || new Date().toISOString(),
        pm25,
        pm10,
        aqi: this.calculateAQI(pm25),
        aqiCategory: this.getAQICategory(pm25),
        dataSource: 'openaq_real',
        hourlyTrend: this.generateHourlyTrend(pm25),
        stationName: data.data.stationName,
        locationId: data.data.locationId,
      };

      console.log('[v0] OpenAQ: Real data received', {
        placeId,
        pm25,
        pm10,
        aqi: realData.aqi,
        station: realData.stationName,
      });

      StorageCache.setAirQualityCache(placeId, realData);
      return realData;
    } catch (error) {
      console.error('[v0] OpenAQ: Fetch error —', error instanceof Error ? error.message : 'Unknown');
      const demoData = this.generateDemoData(placeId, latitude, longitude);
      StorageCache.setAirQualityCache(placeId, demoData);
      return demoData;
    }
  }

  /**
   * Calculate AQI from PM2.5 using EPA breakpoints
   * https://www.airnow.gov/aqi/aqi-basics/
   */
  private calculateAQI(pm25: number): number {
    const breakpoints = [
      { pmLow: 0, pmHigh: 12, aqiLow: 0, aqiHigh: 50 },
      { pmLow: 12.1, pmHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
      { pmLow: 35.5, pmHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
      { pmLow: 55.5, pmHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
      { pmLow: 150.5, pmHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
      { pmLow: 250.5, pmHigh: 500, aqiLow: 301, aqiHigh: 500 },
    ];

    for (const bp of breakpoints) {
      if (pm25 >= bp.pmLow && pm25 <= bp.pmHigh) {
        const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) * (pm25 - bp.pmLow) + bp.aqiLow;
        return Math.round(aqi);
      }
    }

    return 500;
  }

  /**
   * Map AQI to category
   */
  private getAQICategory(pm25: number): AQICategory {
    const aqi = this.calculateAQI(pm25);

    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'satisfactory';
    if (aqi <= 150) return 'moderately-polluted';
    if (aqi <= 200) return 'poor';
    if (aqi <= 300) return 'very-poor';
    return 'severe';
  }

  /**
   * Generate realistic hourly AQI trend
   * Simulates typical daily air quality pattern
   */
  private generateHourlyTrend(basePM25: number): HourlyAQIPoint[] {
    const trend: HourlyAQIPoint[] = [];

    for (let hour = 0; hour < 24; hour++) {
      // Peak pollution typically in morning (6-9 AM) and evening (6-9 PM)
      // Low pollution in afternoon (2-5 PM) and night (midnight-3 AM)
      let variation = 1;

      if (hour >= 6 && hour <= 9) {
        // Morning rush hour peak
        variation = 1.4;
      } else if (hour >= 14 && hour <= 17) {
        // Afternoon lull
        variation = 0.7;
      } else if (hour >= 18 && hour <= 21) {
        // Evening peak
        variation = 1.3;
      } else if (hour >= 0 && hour <= 3) {
        // Night low
        variation = 0.8;
      }

      const pm25 = Math.max(1, basePM25 * variation);
      const aqi = this.calculateAQI(pm25);
      const isOptimal = aqi <= 100; // Good + Satisfactory are optimal for exercise

      trend.push({
        hour,
        pm25: Math.round(pm25 * 10) / 10,
        aqi,
        category: this.getAQICategory(pm25),
        isOptimal,
      });
    }

    return trend;
  }

  /**
   * Generate demo data for testing/fallback
   * Used when real API is unavailable
   */
  private generateDemoData(
    placeId: string,
    latitude: number,
    longitude: number
  ): AirQualityData {
    // Simulate realistic variation based on time of day
    const hour = new Date().getHours();
    let basePM25 = 35; // Default moderate air quality

    // Adjust based on hour (typical pollution pattern)
    if (hour >= 6 && hour <= 9) basePM25 = 50; // Morning peak
    if (hour >= 14 && hour <= 17) basePM25 = 20; // Afternoon low
    if (hour >= 18 && hour <= 21) basePM25 = 45; // Evening peak

    // Add small random variation
    basePM25 += (Math.random() - 0.5) * 10;

    return {
      placeId,
      timestamp: new Date().toISOString(),
      pm25: Math.round(basePM25 * 10) / 10,
      pm10: Math.round(basePM25 * 1.5 * 10) / 10,
      aqi: this.calculateAQI(basePM25),
      aqiCategory: this.getAQICategory(basePM25),
      dataSource: 'demo',
      hourlyTrend: this.generateHourlyTrend(basePM25),
    };
  }

  /**
   * Get optimal workout windows (hours with AQI ≤ 100)
   */
  getOptimalWorkoutWindows(
    aqiData: AirQualityData
  ): Array<{ startHour: number; endHour: number; score: number }> {
    if (!aqiData.hourlyTrend || aqiData.hourlyTrend.length === 0) {
      return [];
    }

    const windows = [];
    let currentWindow: { startHour: number; endHour?: number } | null = null;

    for (const point of aqiData.hourlyTrend) {
      if (point.isOptimal) {
        if (!currentWindow) {
          currentWindow = { startHour: point.hour };
        } else {
          currentWindow.endHour = point.hour;
        }
      } else {
        if (currentWindow) {
          windows.push({
            startHour: currentWindow.startHour,
            endHour: currentWindow.endHour || currentWindow.startHour + 1,
            score: Math.max(1, 100 - point.aqi),
          });
          currentWindow = null;
        }
      }
    }

    // Close last window if still open
    if (currentWindow) {
      windows.push({
        startHour: currentWindow.startHour,
        endHour: 23,
        score: 100,
      });
    }

    return windows;
  }
}

// Singleton instance
export const openaqClient = new OpenAQClient();
