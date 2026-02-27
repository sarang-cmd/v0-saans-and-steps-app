import { AirQualityData, WeatherData, ScoreWindow, Profile, AQICategory } from './types';

export class ScoringEngine {
  /**
   * Calculate air quality score (0-100)
   * Better air quality = higher score
   */
  static calculateAirQualityScore(aqi: number): number {
    if (aqi <= 50) return 100;
    if (aqi <= 100) return 90 - (aqi - 50) * 0.2;
    if (aqi <= 150) return 80 - (aqi - 100) * 0.2;
    if (aqi <= 200) return 70 - (aqi - 150) * 0.2;
    if (aqi <= 300) return 60 - (aqi - 200) * 0.1;
    return Math.max(0, 50 - (aqi - 300) * 0.05);
  }

  /**
   * Calculate weather suitability score for workouts (0-100)
   */
  static calculateWeatherScore(weather: WeatherData): number {
    let score = 100;

    // Temperature penalty (ideal range 15-28°C)
    const temp = weather.temperature;
    if (temp < 0 || temp > 40) {
      score -= 50;
    } else if (temp < 5 || temp > 35) {
      score -= 30;
    } else if (temp < 10 || temp > 30) {
      score -= 15;
    }

    // Wind speed penalty (ideal < 15 km/h)
    const windSpeed = weather.windSpeed;
    if (windSpeed > 40) {
      score -= 50;
    } else if (windSpeed > 25) {
      score -= 30;
    } else if (windSpeed > 15) {
      score -= 15;
    }

    // Weather condition penalty
    const code = weather.weatherCode;
    if (code >= 95 || code === 45 || code === 46) {
      // Thunderstorm or fog
      score -= 60;
    } else if (code >= 70) {
      // Snow
      score -= 40;
    } else if (code >= 60) {
      // Rain
      score -= 25;
    } else if (code >= 51) {
      // Drizzle
      score -= 15;
    }

    // UV index penalty (very high UV)
    if (weather.uvIndex !== undefined && weather.uvIndex > 10) {
      score -= 20;
    } else if (weather.uvIndex !== undefined && weather.uvIndex > 8) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate combined workout suitability score
   * Weighs air quality more for health-sensitive users
   */
  static calculateOverallScore(
    airQualityScore: number,
    weatherScore: number,
    profile: Profile
  ): number {
    // Adjust weights based on sensitivity level
    let aqWeight = 0.6; // 60% weight for air quality by default
    let weatherWeight = 0.4;

    if (profile.sensitivity === 'high') {
      aqWeight = 0.7;
      weatherWeight = 0.3;
    } else if (profile.sensitivity === 'low') {
      aqWeight = 0.5;
      weatherWeight = 0.5;
    }

    return Math.round(airQualityScore * aqWeight + weatherScore * weatherWeight);
  }

  /**
   * Find optimal 2-hour workout windows for a day
   */
  static findOptimalWindows(
    aqData: AirQualityData,
    weatherData: WeatherData,
    profile: Profile
  ): ScoreWindow[] {
    if (!aqData.hourlyTrend || !weatherData.hourlyForecast) {
      return [];
    }

    const windows: ScoreWindow[] = [];

    // Evaluate 2-hour windows
    for (let startHour = 6; startHour < 22; startHour++) {
      const endHour = Math.min(startHour + 2, 23);

      // Calculate average AQI and weather for this window
      const aqPoints = aqData.hourlyTrend.filter(
        (p) => p.hour >= startHour && p.hour < endHour
      );
      const weatherPoints = weatherData.hourlyForecast.filter(
        (p) => p.hour >= startHour && p.hour < endHour
      );

      if (aqPoints.length === 0 || weatherPoints.length === 0) continue;

      const avgAQI = Math.round(
        aqPoints.reduce((sum, p) => sum + p.aqi, 0) / aqPoints.length
      );
      const avgTemp = Math.round(
        weatherPoints.reduce((sum, p) => sum + p.temperature, 0) / weatherPoints.length * 10
      ) / 10;
      const avgWindSpeed = Math.round(
        weatherPoints.reduce((sum, p) => sum + p.windSpeed, 0) / weatherPoints.length * 10
      ) / 10;

      const airQualityScore = this.calculateAirQualityScore(avgAQI);
      const weatherScore = this.calculateWeatherScoreFromValues(avgTemp, avgWindSpeed);
      const overallScore = this.calculateOverallScore(airQualityScore, weatherScore, profile);

      // Determine if this is optimal (score > 70)
      const aqiCategory = this.getAQICategoryFromScore(avgAQI);

      const recommendation = this.getWindowRecommendation(
        overallScore,
        aqiCategory,
        avgTemp,
        avgWindSpeed
      );

      windows.push({
        placeId: aqData.placeId,
        startHour,
        endHour,
        date: new Date().toISOString().split('T')[0],
        airQualityScore,
        weatherScore,
        overallScore,
        recommendation,
        suitableActivities: this.getSuitableActivities(overallScore, avgTemp),
      });
    }

    // Sort by overall score and return top windows
    return windows.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
  }

  /**
   * Calculate weather score from temperature and wind speed
   */
  private static calculateWeatherScoreFromValues(temp: number, windSpeed: number): number {
    let score = 100;

    if (temp < 5 || temp > 35) {
      score -= 30;
    } else if (temp < 10 || temp > 30) {
      score -= 15;
    }

    if (windSpeed > 25) {
      score -= 30;
    } else if (windSpeed > 15) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Get AQI category from numerical score
   */
  private static getAQICategoryFromScore(aqi: number): AQICategory {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'satisfactory';
    if (aqi <= 150) return 'moderately-polluted';
    if (aqi <= 200) return 'poor';
    if (aqi <= 300) return 'very-poor';
    return 'severe';
  }

  /**
   * Get personalized recommendation for a window
   */
  private static getWindowRecommendation(
    score: number,
    aqiCategory: AQICategory,
    temp: number,
    windSpeed: number
  ): string {
    if (score >= 80) {
      return `Excellent conditions! ${temp}°C, light breeze.`;
    } else if (score >= 70) {
      return `Good conditions. Air quality is ${aqiCategory}.`;
    } else if (score >= 60) {
      return `Acceptable, but watch the ${aqiCategory === 'good' ? 'weather' : 'air quality'}.`;
    } else {
      return `Not ideal. Consider staying indoors or using respiratory protection.`;
    }
  }

  /**
   * Get suitable activities based on conditions
   */
  private static getSuitableActivities(score: number, temp: number): string[] {
    const activities: string[] = [];

    if (score >= 80) {
      activities.push('running', 'cycling', 'outdoor-sports', 'yoga');
    } else if (score >= 70) {
      activities.push('walking', 'light-jog', 'yoga');
    } else if (score >= 60) {
      activities.push('gentle-walk', 'stretching');
    } else {
      activities.push('indoor-workout');
      return activities;
    }

    // Temperature-based adjustments
    if (temp < 15) {
      activities = activities.filter((a) => a !== 'outdoor-sports');
    } else if (temp > 30) {
      activities = activities.filter((a) => a !== 'running' && a !== 'outdoor-sports');
    }

    return activities.length > 0 ? activities : ['indoor-workout'];
  }

  /**
   * Calculate 7-day outlook (average scores)
   */
  static calculate7DayOutlook(
    dailyScores: Array<{
      date: string;
      avgAQI: number;
      avgTemp: number;
      avgWindSpeed: number;
    }>,
    profile: Profile
  ): Array<{ date: string; score: number; recommendation: string }> {
    return dailyScores.map(({ date, avgAQI, avgTemp, avgWindSpeed }) => {
      const aqScore = this.calculateAirQualityScore(avgAQI);
      const weatherScore = this.calculateWeatherScoreFromValues(avgTemp, avgWindSpeed);
      const overallScore = this.calculateOverallScore(aqScore, weatherScore, profile);

      return {
        date,
        score: overallScore,
        recommendation: this.getWindowRecommendation(
          overallScore,
          this.getAQICategoryFromScore(avgAQI),
          avgTemp,
          avgWindSpeed
        ),
      };
    });
  }

  /**
   * Check if current conditions are good for outdoor workout
   */
  static isCurrentlyOptimal(
    aqData: AirQualityData,
    weatherData: WeatherData,
    profile: Profile,
    threshold = 70
  ): boolean {
    const aqScore = this.calculateAirQualityScore(aqData.aqi);
    const weatherScore = this.calculateWeatherScore(weatherData);
    const overall = this.calculateOverallScore(aqScore, weatherScore, profile);

    return overall >= threshold;
  }
}
