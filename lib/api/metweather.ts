import { WeatherData, HourlyWeatherPoint } from '../types';
import { StorageCache } from '../storage';

export class METWeatherClient {
  private readonly API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
  // User-Agent is required by MET Norway API
  private readonly USER_AGENT = 'Saans&Steps (https://saansandsteps.app)';
  private readonly DEMO_MODE = true; // Enable demo mode by default

  /**
   * Get weather data for a location
   */
  async getWeatherData(
    placeId: string,
    latitude: number,
    longitude: number,
    useCache = true
  ): Promise<WeatherData | null> {
    // Check cache first
    if (useCache) {
      const cached = StorageCache.getWeatherCache(placeId);
      if (cached) {
        return cached;
      }
    }

    try {
      // Try real API
      if (!this.DEMO_MODE) {
        const data = await this.fetchFromMET(latitude, longitude);
        if (data) {
          data.placeId = placeId;
          StorageCache.setWeatherCache(placeId, data);
          return data;
        }
      }

      // Fallback to demo data
      const demoData = this.generateDemoData(placeId);
      StorageCache.setWeatherCache(placeId, demoData);
      return demoData;
    } catch (error) {
      console.error('[v0] Error fetching weather data:', error);
      return this.generateDemoData(placeId);
    }
  }

  /**
   * Fetch data from real MET Norway API
   */
  private async fetchFromMET(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}?lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': this.USER_AGENT,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MET API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.properties || !data.properties.timeseries) {
        return null;
      }

      // Get first timeseries entry (current conditions)
      const current = data.properties.timeseries[0].data.instant.details;
      const next1h = data.properties.timeseries[0].data.next_1_hours?.details;

      const weatherData: WeatherData = {
        placeId: '',
        timestamp: new Date().toISOString(),
        temperature: current.air_temperature || 25,
        humidity: current.relative_humidity || 60,
        windSpeed: current.wind_speed || 5,
        weatherCode: next1h?.weather_code || 0,
        weatherDescription: this.getWeatherDescription(next1h?.weather_code || 0),
        uvIndex: current.ultraviolet_index_clear_sky,
        feelsLike: this.calculateFeelsLike(
          current.air_temperature || 25,
          current.wind_speed || 5,
          current.relative_humidity || 60
        ),
        hourlyForecast: this.parseHourlyForecast(data.properties.timeseries),
      };

      return weatherData;
    } catch (error) {
      console.error('[v0] MET fetch error:', error);
      return null;
    }
  }

  /**
   * Parse hourly forecast from MET data
   */
  private parseHourlyForecast(timeseries: any[]): HourlyWeatherPoint[] {
    const forecast: HourlyWeatherPoint[] = [];

    for (let i = 0; i < Math.min(timeseries.length, 24); i++) {
      const entry = timeseries[i];
      const details = entry.data.instant.details;
      const next1h = entry.data.next_1_hours?.details;

      forecast.push({
        hour: new Date(entry.time).getHours(),
        temperature: details.air_temperature || 25,
        weatherCode: next1h?.weather_code || 0,
        windSpeed: details.wind_speed || 0,
        humidity: details.relative_humidity || 60,
      });
    }

    return forecast;
  }

  /**
   * Get weather description from WMO weather code
   */
  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      46: 'Fog with rime',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Heavy drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with hail',
    };

    return descriptions[code] || 'Unknown weather';
  }

  /**
   * Calculate feels-like temperature
   * Using simplified wind chill formula
   */
  private calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
    // Wind chill factor
    const windChill = temp - 0.2 * (windSpeed - 1);

    // Humidity adjustment (heat index for warm temperatures)
    let feelsLike = windChill;
    if (temp > 20) {
      const heatIndex = -42.379 + 2.04901523 * temp + 10.14333127 * humidity -
        0.22475541 * temp * humidity - 0.00683783 * temp * temp -
        0.05481717 * humidity * humidity + 0.00122874 * temp * temp * humidity +
        0.00085282 * temp * humidity * humidity - 0.00000199 * temp * temp * humidity * humidity;
      feelsLike = (feelsLike + heatIndex) / 2; // Average of wind chill and heat index
    }

    return Math.round(feelsLike * 10) / 10;
  }

  /**
   * Get weather suitability score (0-100) for outdoor activities
   */
  getActivityScore(weatherData: WeatherData): number {
    let score = 100;

    // Temperature penalty (ideal range 15-28°C)
    const temp = weatherData.temperature;
    if (temp < 5 || temp > 35) {
      score -= 40;
    } else if (temp < 10 || temp > 30) {
      score -= 20;
    }

    // Wind speed penalty (ideal < 15 km/h)
    if (weatherData.windSpeed > 30) {
      score -= 30;
    } else if (weatherData.windSpeed > 20) {
      score -= 15;
    }

    // Weather code penalty
    const code = weatherData.weatherCode;
    if (code >= 95 || code === 45 || code === 46) {
      // Thunderstorm or fog
      score -= 50;
    } else if (code >= 70) {
      // Snow
      score -= 30;
    } else if (code >= 60) {
      // Rain
      score -= 20;
    }

    // UV index (if available)
    if (weatherData.uvIndex !== undefined && weatherData.uvIndex > 8) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Generate demo weather data for testing
   */
  private generateDemoData(placeId: string): WeatherData {
    const hour = new Date().getHours();

    // Simulate temperature variation throughout the day
    const baseTemp = 22 + Math.sin((hour - 6) * (Math.PI / 12)) * 8;
    const temperature = baseTemp + (Math.random() - 0.5) * 2;

    // Morning = clearer, afternoon = partly cloudy
    const weatherCode = hour >= 6 && hour <= 18 ? 1 : 0;

    const data: WeatherData = {
      placeId,
      timestamp: new Date().toISOString(),
      temperature: Math.round(temperature * 10) / 10,
      humidity: 60 + Math.random() * 20,
      windSpeed: 8 + Math.random() * 7,
      weatherCode,
      weatherDescription: this.getWeatherDescription(weatherCode),
      uvIndex: hour >= 10 && hour <= 16 ? 5 + Math.random() * 3 : 1,
      feelsLike: Math.round((temperature - 1) * 10) / 10,
      hourlyForecast: this.generateDemoHourlyForecast(),
    };

    return data;
  }

  /**
   * Generate demo hourly forecast
   */
  private generateDemoHourlyForecast(): HourlyWeatherPoint[] {
    const forecast: HourlyWeatherPoint[] = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const hour = (now.getHours() + i) % 24;
      const baseTemp = 22 + Math.sin((hour - 6) * (Math.PI / 12)) * 8;

      forecast.push({
        hour,
        temperature: Math.round((baseTemp + (Math.random() - 0.5) * 2) * 10) / 10,
        weatherCode: Math.random() > 0.7 ? 2 : 0,
        windSpeed: 5 + Math.random() * 10,
        humidity: 55 + Math.random() * 30,
      });
    }

    return forecast;
  }
}

// Singleton instance
export const metWeatherClient = new METWeatherClient();
