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

    // OpenAQ v3 API - first find nearest location, then get latest measurements
    const locResponse = await fetch(
      `https://api.openaq.org/v3/locations?coordinates=${lat},${lng}&radius=50000&limit=1`,
      { headers }
    );

    if (!locResponse.ok) {
      console.error(`[v0] OpenAQ locations API returned ${locResponse.status}`, {
        lat,
        lng,
        hasApiKey: !!apiKey,
      });
      return Response.json(
        { success: false, error: `OpenAQ API error: ${locResponse.status}` },
        { status: locResponse.status }
      );
    }

    const locData = await locResponse.json();

    if (!locData.results || locData.results.length === 0) {
      console.warn('[v0] No air quality stations found nearby', { lat, lng });
      return Response.json(
        { success: false, error: 'No air quality stations found nearby' },
        { status: 404 }
      );
    }

    const locationId = locData.results[0].id;
    console.log('[v0] Found station:', { locationId, lat, lng });

    // Fetch latest measurements for the nearest station
    const measResponse = await fetch(
      `https://api.openaq.org/v3/locations/${locationId}/latest`,
      { headers }
    );

    if (!measResponse.ok) {
      console.error(`[v0] OpenAQ measurements API returned ${measResponse.status}`, {
        locationId,
        hasApiKey: !!apiKey,
      });
      return Response.json(
        { success: false, error: `OpenAQ measurements error: ${measResponse.status}` },
        { status: measResponse.status }
      );
    }

    const measData = await measResponse.json();
    const results = measData.results || [];

    console.log('[v0] Received measurements:', {
      locationId,
      resultCount: results.length,
      measurements: results.map((r: any) => ({
        parameter: r.parameter?.name ?? r.parameter,
        value: r.value,
      })),
    });

    let pm25 = 0;
    let pm10 = 0;

    for (const m of results) {
      const paramName = m.parameter?.name ?? m.parameter;
      if (paramName === 'pm25' || paramName === 'pm2.5') pm25 = m.value ?? 0;
      if (paramName === 'pm10') pm10 = m.value ?? 0;
    }

    return Response.json({
      success: true,
      data: {
        pm25,
        pm10,
        timestamp: new Date().toISOString(),
        source: 'openaq',
        locationId,
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
