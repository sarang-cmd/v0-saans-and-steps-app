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
    // Proxy request to OpenAQ API (correct hostname: api.openaq.org)
    const response = await fetch(
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lng}&radius=50000&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Saans-Steps-App/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`[v0] OpenAQ API returned ${response.status}`);
      return Response.json(
        { success: false, error: `OpenAQ API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return Response.json(
        { success: false, error: 'No air quality data available' },
        { status: 404 }
      );
    }

    // OpenAQ v2 returns measurements in a nested structure
    const result = data.results[0];
    const measurements = result.measurements || [];

    let pm25 = 0;
    let pm10 = 0;

    for (const m of measurements) {
      if (m.parameter === 'pm25') pm25 = m.value || 0;
      if (m.parameter === 'pm10') pm10 = m.value || 0;
    }

    return Response.json({
      success: true,
      data: {
        pm25,
        pm10,
        timestamp: new Date().toISOString(),
        source: 'openaq',
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
