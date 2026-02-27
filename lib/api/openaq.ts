import { AirQualityData, HourlyAQIPoint, AQICategory } from '../types';
import { StorageCache } from '../storage';

export class OpenAQClient {
  private apiKey: string = '';
  private readonly API_BASE_URL = 'https://api.openaq.org/v2';
  private readonly DEMO_MODE = true; // Enable demo mode by default

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get Air Quality data for a location
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
        return cached;
      }
    }

    try {
      // Try real API if key available
      if (this.apiKey && !this.DEMO_MODE) {
        const data = await this.fetchFromOpenAQ(latitude, longitude);
        if (data) {
          StorageCache.setAirQualityCache(placeId, data);
          return data;
        }
      }

      // Fallback to demo data
      const demoData = this.generateDemoData(placeId, latitude, longitude);
      StorageCache.setAirQualityCache(placeId, demoData);
      return demoData;
    } catch (error) {
      console.error('[v0] Error fetching air quality data:', error);
      return this.generateDemoData(placeId, latitude, longitude);
    }
  }

  /**
   * Fetch data from real OpenAQ API
   */
  private async fetchFromOpenAQ(
    latitude: number,
    longitude: number
  ): Promise<AirQualityData | null> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/latest?coordinates=${latitude},${longitude}&radius=50000`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAQ API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      const pm25 = result.pm25 || 0;
      const pm10 = result.pm10 || 0;

      return {
        placeId: '',
        timestamp: new Date().toISOString(),
        pm25,
        pm10,
        aqi: this.calculateAQI(pm25),
        aqiCategory: this.getAQICategory(pm25),
        dataSource: 'openaq',
        hourlyTrend: this.generateHourlyTrend(pm25),
      };
    } catch (error) {
      console.error('[v0] OpenAQ fetch error:', error);
      return null;
    }
  }

  /**
   * Calculate AQI from PM2.5
   * Using EPA AQI formula
   */
  private calculateAQI(pm25: number): number {
    const breakpoints = [
      { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
      { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
      { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
      { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
      { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
      { low: 250.5, high: 500, aqiLow: 301, aqiHigh: 500 },
    ];

    for (const bp of breakpoints) {
      if (pm25 >= bp.low && pm25 <= bp.high) {
        return (
          ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow
        );
      }
    }

    return 500;
  }

  /**
   * Get AQI category from PM2.5 level
   */
  private getAQICategory(pm25: number): AQICategory {
    if (pm25 <= 12) return 'good';
    if (pm25 <= 35.4) return 'satisfactory';
    if (pm25 <= 55.4) return 'moderately-polluted';
    if (pm25 <= 150.4) return 'poor';
    if (pm25 <= 250.4) return 'very-poor';
    return 'severe';
  }

  /**
   * Generate hourly AQI trend for demo/visualization
   */
  private generateHourlyTrend(basePM25: number): HourlyAQIPoint[] {
    const trend: HourlyAQIPoint[] = [];
    const now = new Date();

    for (let hour = 0; hour < 24; hour++) {
      // Simulate variation throughout the day
      const variation = Math.sin((hour - 6) * (Math.PI / 12)) * 0.3 + 1;
      const pm25 = Math.max(1, basePM25 * variation);
      const aqi = this.calculateAQI(pm25);

      trend.push({
        hour,
        pm25: Math.round(pm25 * 10) / 10,
        aqi: Math.round(aqi),
        category: this.getAQICategory(pm25),
        isOptimal: aqi <= 100 && hour >= 6 && hour <= 18,
      });
    }

    return trend;
  }

  /**
   * Generate demo data for testing/fallback
   */
  private generateDemoData(
    placeId: string,
    latitude: number,
    longitude: number
  ): AirQualityData {
    // Simulate different air quality for different times of day
    const hour = new Date().getHours();
    const basePM25 = 45 + Math.sin((hour - 6) * (Math.PI / 12)) * 20; // Varies 25-65

    return {
      placeId,
      timestamp: new Date().toISOString(),
      pm25: Math.round(basePM25 * 10) / 10,
      pm10: Math.round(basePM25 * 1.5 * 10) / 10,
      aqi: Math.round(this.calculateAQI(basePM25)),
      aqiCategory: this.getAQICategory(basePM25),
      dataSource: 'demo',
      hourlyTrend: this.generateHourlyTrend(basePM25),
    };
  }

  /**
   * Get optimal workout windows for a day
   * Returns hours with AQI <= 100
   */
  getOptimalWorkoutWindows(aqiData: AirQualityData): Array<{ startHour: number; endHour: number; score: number }> {
    if (!aqiData.hourlyTrend) {
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
            score: 100 - point.aqi,
          });
          currentWindow = null;
        }
      }
    }

    // Close last window if open
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
