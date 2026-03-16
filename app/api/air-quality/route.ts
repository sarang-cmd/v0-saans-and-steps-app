export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json(
      { success: false, error: 'Missing latitude and longitude parameters' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.OPENAQ_API_KEY;
    
    // Build headers with API key if available
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'Saans-Steps-App/1.0',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    // Truncate coordinates to 4 decimal places as per OpenAQ v3 API spec
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const latTrunc = Math.round(latNum * 10000) / 10000;
    const lngTrunc = Math.round(lngNum * 10000) / 10000;

    console.log('[v0] OpenAQ: Fetching air quality data', {
      original: { lat, lng },
      truncated: { lat: latTrunc, lng: lngTrunc },
      hasApiKey: !!apiKey,
    });

    // Step 1: Find nearest monitoring station
    // CRITICAL: radius must be ≤ 25000 meters (25 km), NOT 50000!
    const locUrl = new URL('https://api.openaq.org/v3/locations');
    locUrl.searchParams.set('coordinates', `${latTrunc},${lngTrunc}`);
    locUrl.searchParams.set('radius', '10000'); // 10 km search radius
    locUrl.searchParams.set('limit', '1');

    console.log('[v0] OpenAQ: Locations request', {
      url: locUrl.toString(),
      coordinates: `${latTrunc},${lngTrunc}`,
    });

    const locResponse = await fetch(locUrl.toString(), { headers });

    if (!locResponse.ok) {
      const errorText = await locResponse.text().catch(() => '');
      console.error('[v0] OpenAQ: Locations API error', {
        status: locResponse.status,
        statusText: locResponse.statusText,
        error: errorText.slice(0, 300),
      });
      return Response.json(
        {
          success: false,
          error: `Locations API error: ${locResponse.status}`,
        },
        { status: locResponse.status }
      );
    }

    const locData = await locResponse.json();

    if (!locData.results || locData.results.length === 0) {
      console.warn('[v0] OpenAQ: No stations found', {
        coordinates: `${latTrunc},${lngTrunc}`,
      });
      return Response.json(
        {
          success: false,
          error: 'No air quality monitoring stations found within 10 km',
        },
        { status: 404 }
      );
    }

    const locationId = locData.results[0].id;
    const stationName = locData.results[0].name || 'Unknown Station';

    console.log('[v0] OpenAQ: Found station', {
      id: locationId,
      name: stationName,
    });

    // Step 2: Get latest measurements from the nearest station
    const measUrl = `https://api.openaq.org/v3/locations/${locationId}/latest`;

    const measResponse = await fetch(measUrl, { headers });

    if (!measResponse.ok) {
      const errorText = await measResponse.text().catch(() => '');
      console.error('[v0] OpenAQ: Measurements API error', {
        status: measResponse.status,
        statusText: measResponse.statusText,
        error: errorText.slice(0, 300),
      });
      return Response.json(
        {
          success: false,
          error: `Measurements API error: ${measResponse.status}`,
        },
        { status: measResponse.status }
      );
    }

    const measData = await measResponse.json();
    const measurements = Array.isArray(measData.results) ? measData.results : [];

    console.log('[v0] OpenAQ: Received measurements', {
      locationId,
      stationName,
      count: measurements.length,
      parameters: measurements.map((m: any) => ({
        id: m.parameter?.id,
        name: m.parameter?.name,
        value: m.value,
        unit: m.unit,
      })),
    });

    // Step 3: Extract PM2.5 and PM10 values
    let pm25 = 0;
    let pm10 = 0;
    let lastUpdated = new Date().toISOString();

    for (const m of measurements) {
      const paramId = (m.parameter?.id ?? '').toLowerCase();
      const paramName = (m.parameter?.name ?? '').toLowerCase();

      if (paramId === 'pm25' || paramName.includes('pm2.5')) {
        pm25 = m.value ?? 0;
      }
      if (paramId === 'pm10' || paramName === 'pm10') {
        pm10 = m.value ?? 0;
      }

      if (m.lastUpdated) {
        lastUpdated = m.lastUpdated;
      }
    }

    console.log('[v0] OpenAQ: Extracted pollutant values', {
      pm25,
      pm10,
      lastUpdated,
    });

    return Response.json({
      success: true,
      data: {
        pm25,
        pm10,
        timestamp: lastUpdated,
        source: 'openaq_real',
        locationId,
        stationName,
      },
    });
  } catch (error) {
    console.error('[v0] OpenAQ: Unexpected error', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
