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
    // Proxy request to OpenAQ API
    const response = await fetch(
      `https://api.openaqdata.org/v2/latest?coordinates=${lat},${lng}&radius=50000`,
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

    const result = data.results[0];
    const pm25 = result.pm25 || 0;
    const pm10 = result.pm10 || 0;

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
