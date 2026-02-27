import { Place, Indian City } from './types';
import indianCities from '@/data/indian-cities.json';

export class PlacesManager {
  /**
   * Get all predefined Indian cities
   */
  static getAllIndianCities(): Place[] {
    return indianCities.cities.map((city, index) => ({
      id: `city-${index}`,
      name: city.name,
      type: 'city',
      latitude: city.latitude,
      longitude: city.longitude,
      state: city.state,
      country: 'India',
      addedAt: new Date(0).toISOString(),
    }));
  }

  /**
   * Get all NCR sub-areas
   */
  static getNCRSubAreas(): Place[] {
    return indianCities.ncrAreas.map((area, index) => ({
      id: `ncr-${index}`,
      name: area.name,
      type: 'ncr-area',
      latitude: area.latitude,
      longitude: area.longitude,
      state: area.state,
      country: 'India',
      addedAt: new Date(0).toISOString(),
    }));
  }

  /**
   * Create a custom place
   */
  static createCustomPlace(
    name: string,
    latitude: number,
    longitude: number,
    state?: string
  ): Place {
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      type: 'custom',
      latitude,
      longitude,
      state,
      country: 'India',
      addedAt: new Date().toISOString(),
    };
  }

  /**
   * Search places by name
   */
  static searchPlaces(query: string, includeNCR: boolean = true): Place[] {
    const lowerQuery = query.toLowerCase();
    let results: Place[] = [];

    // Search in predefined cities
    const cities = this.getAllIndianCities().filter((place) =>
      place.name.toLowerCase().includes(lowerQuery) ||
      place.state?.toLowerCase().includes(lowerQuery)
    );
    results.push(...cities);

    // Search in NCR areas if requested
    if (includeNCR) {
      const ncrAreas = this.getNCRSubAreas().filter((place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.state?.toLowerCase().includes(lowerQuery)
      );
      results.push(...ncrAreas);
    }

    return results.slice(0, 10); // Limit to 10 results
  }

  /**
   * Get nearby places for a given latitude/longitude
   */
  static getNearbyPlaces(latitude: number, longitude: number, radiusKm: number = 100): Place[] {
    const allPlaces = [...this.getAllIndianCities(), ...this.getNCRSubAreas()];
    
    return allPlaces
      .map((place) => ({
        place,
        distance: this.calculateDistance(
          latitude,
          longitude,
          place.latitude,
          place.longitude
        ),
      }))
      .filter(({ distance }) => distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map(({ place }) => place)
      .slice(0, 10);
  }

  /**
   * Calculate distance between two coordinates (in km)
   * Using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format place name with state
   */
  static formatPlaceName(place: Place): string {
    if (place.state && place.state !== 'Delhi') {
      return `${place.name}, ${place.state}`;
    }
    return place.name;
  }

  /**
   * Get place by ID
   */
  static getPlaceById(id: string): Place | null {
    const allPlaces = [...this.getAllIndianCities(), ...this.getNCRSubAreas()];
    return allPlaces.find((p) => p.id === id) || null;
  }

  /**
   * Validate place coordinates
   */
  static isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}

/**
 * Get user's geolocation and find nearby places
 */
export async function getUserLocationAndNearbyPlaces(): Promise<{
  latitude: number;
  longitude: number;
  places: Place[];
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearby = PlacesManager.getNearbyPlaces(latitude, longitude, 50);
        resolve({ latitude, longitude, places: nearby });
      },
      () => {
        // If geolocation fails, return null
        resolve(null);
      }
    );
  });
}
