# OpenAQ v3 API Implementation Guide

## Overview
OpenAQ is a global air quality data platform providing real-time and historical air quality measurements from thousands of monitoring stations worldwide. The v3 API is the latest REST endpoint for accessing this data programmatically.

## Key API Specifications

### Base URL
```
https://api.openaq.org/v3
```

### Authentication
- **Optional:** API key for higher rate limits and priority access
- **Header:** `X-API-Key: YOUR-API-KEY`
- **Free Tier:** Works without key (~60 requests/minute)
- **With Key:** Higher limits depending on plan tier

### Critical Parameters

#### 1. `/locations` Endpoint
Finds air quality monitoring stations near a location.

**Query Parameters:**
- `coordinates`: Format `latitude,longitude` (required for proximity search)
  - Both values must be truncated/rounded to **max 4 decimal places**
  - Example: `28.6139,77.2090` (Delhi)
- `radius`: Search radius in meters
  - **Maximum: 25000 meters (25 km)** ⚠️ NOT 50000!
  - Default: 1000 meters
  - Example: `radius=10000` (10 km search area)
- `limit`: Number of results
  - Default: 100
  - Max: varies by tier
- `page`: Pagination (default: 1)

**Response Structure:**
```json
{
  "results": [
    {
      "id": "location-uuid",
      "name": "Station Name",
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139]
      },
      "country": "IN",
      "city": "Delhi",
      "isMobile": false,
      "isAnalysis": false
    }
  ],
  "meta": {
    "found": 1,
    "page": 1,
    "limit": 100
  }
}
```

#### 2. `/locations/{id}/latest` Endpoint
Fetches the most recent measurements from a specific station.

**Response Structure:**
```json
{
  "results": [
    {
      "parameter": {
        "id": "pm25",
        "name": "PM2.5",
        "displayName": "PM2.5",
        "description": "Particulate matter < 2.5 micrometers"
      },
      "value": 45.2,
      "unit": "µg/m³",
      "lastUpdated": "2026-03-01T12:30:00Z",
      "isMobile": false
    },
    {
      "parameter": {
        "id": "pm10",
        "name": "PM10",
        "displayName": "PM10",
        "description": "Particulate matter < 10 micrometers"
      },
      "value": 67.8,
      "unit": "µg/m³",
      "lastUpdated": "2026-03-01T12:30:00Z",
      "isMobile": false
    }
  ]
}
```

## AQI Calculation from PM2.5

OpenAQ doesn't calculate AQI directly—stations report raw pollutant values. Use this EPA formula to convert PM2.5 to AQI:

```typescript
function calculateAQI(pm25: number): number {
  const breakpoints = [
    { pmLow: 0, pmHigh: 12, aqiLow: 0, aqiHigh: 50 },       // Good
    { pmLow: 12.1, pmHigh: 35.4, aqiLow: 51, aqiHigh: 100 }, // Satisfactory
    { pmLow: 35.5, pmHigh: 55.4, aqiLow: 101, aqiHigh: 150 }, // Moderate
    { pmLow: 55.5, pmHigh: 150.4, aqiLow: 151, aqiHigh: 200 }, // Poor
    { pmLow: 150.5, pmHigh: 250.4, aqiLow: 201, aqiHigh: 300 }, // Very Poor
    { pmLow: 250.5, pmHigh: 500, aqiLow: 301, aqiHigh: 500 }, // Severe
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.pmLow && pm25 <= bp.pmHigh) {
      const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) * (pm25 - bp.pmLow) + bp.aqiLow;
      return Math.round(aqi);
    }
  }
  return 500;
}

function getAQICategory(aqi: number): 'good' | 'satisfactory' | 'moderate' | 'poor' | 'very-poor' | 'severe' {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 150) return 'moderate';
  if (aqi <= 200) return 'poor';
  if (aqi <= 300) return 'very-poor';
  return 'severe';
}
```

## Implementation Flow

### Step 1: Get User Location
```typescript
// Get user's GPS coordinates
const { latitude, longitude } = await navigator.geolocation.getCurrentPosition();
```

### Step 2: Find Nearest Station
```typescript
const coordinates = `${Math.round(latitude * 10000) / 10000},${Math.round(longitude * 10000) / 10000}`;
const url = new URL('https://api.openaq.org/v3/locations');
url.searchParams.set('coordinates', coordinates);
url.searchParams.set('radius', '10000'); // Max 25000
url.searchParams.set('limit', '1');

const response = await fetch(url.toString(), {
  headers: {
    'X-API-Key': process.env.OPENAQ_API_KEY,
  },
});

const data = await response.json();
const nearestStation = data.results[0];
const stationId = nearestStation.id;
```

### Step 3: Get Latest Measurements
```typescript
const measUrl = `https://api.openaq.org/v3/locations/${stationId}/latest`;
const measResponse = await fetch(measUrl, {
  headers: {
    'X-API-Key': process.env.OPENAQ_API_KEY,
  },
});

const measurements = await measResponse.json();

// Extract PM2.5 and PM10
let pm25 = 0, pm10 = 0;
for (const m of measurements.results) {
  if (m.parameter.id === 'pm25' || m.parameter.name === 'PM2.5') {
    pm25 = m.value;
  }
  if (m.parameter.id === 'pm10' || m.parameter.name === 'PM10') {
    pm10 = m.value;
  }
}

const aqi = calculateAQI(pm25);
const category = getAQICategory(aqi);
```

## Error Handling

### Common Errors

| Status | Meaning | Solution |
|--------|---------|----------|
| 200 | Success | Data is valid |
| 400 | Bad Request | Check parameter format (radius ≤ 25000) |
| 401 | Unauthorized | API key invalid or expired |
| 404 | Not Found | No stations near coordinates |
| 422 | Unprocessable Entity | Invalid parameter values (e.g., radius > 25000) |
| 429 | Rate Limited | Too many requests; implement backoff |
| 500 | Server Error | OpenAQ API issue; retry later |

### Example Error Response
```json
{
  "message": "Unprocessable Entity",
  "errors": [
    {
      "type": "less_than_equal",
      "loc": ["query", "radius"],
      "msg": "Input should be less than or equal to 25000",
      "input": "50000"
    }
  ]
}
```

## Best Practices

1. **Cache Results:** Measurements update every 1-6 hours; cache for at least 30 minutes
2. **Rate Limiting:** Implement 5-10 second delays between requests per location
3. **Fallback Strategy:** Have cached or demo data for when API fails
4. **Error Recovery:** On 404 (no stations), expand radius or show nearest city data
5. **Truncate Coordinates:** Always round to 4 decimal places to match API spec
6. **Use Server Route:** Proxy through your backend to avoid CORS and expose API key safely

## Testing Coordinates

### India (Good for testing)
- Delhi: `28.6139, 77.2090`
- Mumbai: `19.0760, 72.8777`
- Bangalore: `12.9716, 77.5946`
- Hyderabad: `17.3850, 78.4867`
- Jaipur: `26.9124, 75.7873`

### Search Parameters to Test
```typescript
// Should work (radius ≤ 25000)
radius=10000  // ✅ Good
radius=25000  // ✅ Max allowed
radius=50000  // ❌ Will return 422 error

// Coordinate formatting
coordinates=28.6139,77.2090     // ✅ Correct (4 decimals)
coordinates=28.61394,77.20897   // ✅ Works (5 decimals acceptable)
coordinates=28,77               // ✅ Works (fewer decimals)
```

## Complete Example: Backend Route

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const latTrunc = Math.round(parseFloat(lat) * 10000) / 10000;
    const lngTrunc = Math.round(parseFloat(lng) * 10000) / 10000;

    // Step 1: Find station
    const locUrl = new URL('https://api.openaq.org/v3/locations');
    locUrl.searchParams.set('coordinates', `${latTrunc},${lngTrunc}`);
    locUrl.searchParams.set('radius', '10000');
    locUrl.searchParams.set('limit', '1');

    const locRes = await fetch(locUrl.toString(), {
      headers: { 'X-API-Key': process.env.OPENAQ_API_KEY! },
    });

    if (!locRes.ok) throw new Error(`Locations: ${locRes.status}`);
    const locData = await locRes.json();

    if (!locData.results?.[0]) {
      return Response.json({ error: 'No stations found' }, { status: 404 });
    }

    const stationId = locData.results[0].id;

    // Step 2: Get measurements
    const measRes = await fetch(
      `https://api.openaq.org/v3/locations/${stationId}/latest`,
      { headers: { 'X-API-Key': process.env.OPENAQ_API_KEY! } }
    );

    if (!measRes.ok) throw new Error(`Measurements: ${measRes.status}`);
    const measurements = await measRes.json();

    let pm25 = 0, pm10 = 0;
    for (const m of measurements.results || []) {
      if (['pm25', 'pm2.5'].includes(m.parameter?.id?.toLowerCase())) pm25 = m.value;
      if (m.parameter?.id?.toLowerCase() === 'pm10') pm10 = m.value;
    }

    return Response.json({ pm25, pm10, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('OpenAQ error:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

## References
- OpenAQ API Docs: https://docs.openaq.org
- EPA AQI Formula: https://www.airnow.gov/aqi/aqi-basics/
- OpenAQ GitHub: https://github.com/openaq
