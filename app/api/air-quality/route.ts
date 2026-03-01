export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return Response.json(
      { success: false, error: 'Missing lat/lng parameters' },
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
    
    console.log('[v0] Fetching air quality for:', {
      original: { lat, lng },
      truncated: { lat: latTrunc, lng: lngTrunc },
      hasApiKey: !!apiKey,
    });

    // OpenAQ v3 API - first find nearest location, then get latest measurements
    // Coordinates parameter format: "latitude,longitude" (both truncated to 4 decimals)
    const coordinatesParam = `${latTrunc},${lngTrunc}`;
    const url = new URL('https://api.openaq.org/v3/locations');
    url.searchParams.set('coordinates', coordinatesParam);
    url.searchParams.set('radius', '50000');
    url.searchParams.set('limit', '1');

    console.log('[v0] OpenAQ request URL:', {
      fullUrl: url.toString(),
      coordinates: coordinatesParam,
      hasApiKey: !!apiKey,
    });

    const locResponse = await fetch(url.toString(), { headers });

    if (!locResponse.ok) {
      const errorText = await locResponse.text().catch(() => '');
      const errorJson = errorText.startsWith('{') ? JSON.parse(errorText).catch(() => ({})) : {};
      console.error('[v0] OpenAQ locations API error:', {
        status: locResponse.status,
        statusText: locResponse.statusText,
        coordinates: `${latTrunc},${lngTrunc}`,
        hasApiKey: !!apiKey,
        errorResponse: errorText.slice(0, 200),
        parsedError: errorJson,
      });
      return Response.json(
        { success: false, error: `OpenAQ API error: ${locResponse.status} ${locResponse.statusText}` },
        { status: locResponse.status }
      );
    }

    const locData = await locResponse.json();

    if (!locData.results || locData.results.length === 0) {
      console.warn('[v0] No air quality stations found nearby', {
        coordinates: `${latTrunc},${lngTrunc}`,
      });
      return Response.json(
        { success: false, error: 'No air quality stations found nearby' },
        { status: 404 }
      );
    }

    const locationId = locData.results[0].id;
    const stationName = locData.results[0].name || 'Unknown';
    console.log('[v0] Found nearest station:', {
      id: locationId,
      name: stationName,
      coordinates: `${latTrunc},${lngTrunc}`,
    });

    // Fetch latest measurements for the nearest station
    const measResponse = await fetch(
      `https://api.openaq.org/v3/locations/${locationId}/latest`,
      { headers }
    );

    if (!measResponse.ok) {
      const errorText = await measResponse.text().catch(() => '');
      console.error('[v0] OpenAQ measurements API error:', {
        status: measResponse.status,
        statusText: measResponse.statusText,
        locationId,
        hasApiKey: !!apiKey,
        errorResponse: errorText.slice(0, 500),
      });
      return Response.json(
        { success: false, error: `OpenAQ measurements error: ${measResponse.status}` },
        { status: measResponse.status }
      );
    }

    const measData = await measResponse.json();
    const results = Array.isArray(measData.results) ? measData.results : [];

    console.log('[v0] Received measurements:', {
      locationId,
      stationName,
      resultCount: results.length,
      measurements: results.slice(0, 5).map((r: any) => ({
        parameter: r.parameter?.name ?? r.parameter,
        value: r.value,
        unit: r.unit,
        lastUpdated: r.lastUpdated,
      })),
    });

    let pm25 = 0;
    let pm10 = 0;

    for (const m of results) {
      const paramName = (m.parameter?.name ?? m.parameter ?? '').toLowerCase();
      if (paramName.includes('pm2.5') || paramName === 'pm25') pm25 = m.value ?? 0;
      if (paramName === 'pm10') pm10 = m.value ?? 0;
    }

    console.log('[v0] Extracted air quality values:', { pm25, pm10 });

    return Response.json({
      success: true,
      data: {
        pm25,
        pm10,
        timestamp: new Date().toISOString(),
        source: 'openaq',
        locationId,
        stationName,
      },
    });
  } catch (error) {
    console.error('[v0] Air quality proxy error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
