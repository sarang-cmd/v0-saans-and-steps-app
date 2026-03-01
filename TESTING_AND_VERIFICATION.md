# Verification & Testing Guide

## Quick Start - Manual Testing

### Test 1: Verify Real Data is Fetching ✅

**Steps:**
1. Open the app and allow location access
2. Wait for the page to load
3. Open browser DevTools (F12) and go to Console tab
4. Look for logs starting with `[v0] OpenAQ:`

**Expected Output:**
```
[v0] OpenAQ: Fetching real data for delhi
[v0] OpenAQ: Locations request URL: https://api.openaq.org/v3/locations?coordinates=28.6139,77.2090&radius=10000&limit=1
[v0] OpenAQ: Found station id=uuid name="Station Name"
[v0] OpenAQ: Real data received pm25=42.5 pm10=78.3 aqi=87 station="Nearest Station"
```

**What to Look For:**
- ✓ `dataSource: 'openaq_real'` (not 'demo')
- ✓ `stationName` is populated
- ✓ PM2.5 and PM10 are non-zero realistic values
- ✓ Timestamp matches current time

### Test 2: Verify AQI Calculation ✅

**Manual Calculation Check:**
- If PM2.5 = 45.2, expected AQI = 125 (moderately-polluted)
- Formula: `((150 - 101) / (55.4 - 35.5)) * (45.2 - 35.5) + 101 = 125`

**In App:**
1. Note the PM2.5 value from the AQI Card
2. Calculate expected AQI using EPA breakpoints
3. Compare with displayed AQI number

**Verify:** AQI value matches calculation ✓

### Test 3: Verify Caching (30-minute TTL) ✅

**Steps:**
1. Load app and view air quality (note timestamp in console)
2. Refresh page (F5) within 30 minutes
3. Check console logs

**Expected Behavior:**
- First load: `[v0] OpenAQ: Fetching real data for...`
- After refresh: `[v0] OpenAQ: Using cached data for...`
- Network tab shows NO new request to `/api/air-quality`

### Test 4: Verify Rate Limiting (5-second minimum) ✅

**Steps:**
1. Load app (fetches air quality)
2. Immediately switch location or refresh (within 5 seconds)
3. Check console

**Expected Behavior:**
- First request: Real data fetched
- Second request (<5s later): `[v0] OpenAQ: Rate limited, using demo data`
- Demo data shows `dataSource: 'demo'`

### Test 5: Verify Fallback to Demo Data ✅

**Trigger Demo Fallback:**
- Turn off internet → see demo data
- Go to remote location with no stations → 404 error, shows demo data
- Remove API key from environment → uses free tier or demo

**Expected Behavior:**
```
[v0] OpenAQ: Proxy returned 404 — using demo data
[v0] OpenAQ: Real data received (demo) pm25=38.5 pm10=62.3
```

## Console Debug Output Reference

### Successful Real Data Fetch
```
[v0] OpenAQ: Fetching real data for delhi
[v0] OpenAQ: Locations request URL: https://api.openaq.org/v3/locations?coordinates=28.6139,77.2090&radius=10000&limit=1
[v0] OpenAQ: Found station id=location-uuid-123 name="New Delhi Central"
[v0] OpenAQ: Real data received pm25=45.2 pm10=67.8 aqi=125 station="New Delhi Central"
```

### Rate Limited (Uses Cache/Demo)
```
[v0] OpenAQ: Rate limited, using demo data for mumbai
```

### Cache Hit
```
[v0] OpenAQ: Using cached data for bangalore
```

### No Stations Found
```
[v0] OpenAQ: Proxy returned 404 — using demo data
```

### API Authentication Error
```
[v0] OpenAQ: Proxy returned 401 — using demo data
```

## Expected Values by City (India)

### Delhi (28.6139, 77.2090)
- **Typical PM2.5:** 35–80 µg/m³
- **Expected AQI:** 88–180
- **Station Name:** Usually "New Delhi - ITO" or similar

### Mumbai (19.0760, 72.8777)
- **Typical PM2.5:** 25–60 µg/m³
- **Expected AQI:** 70–140
- **Station Name:** Usually near Navi Mumbai or Colaba

### Bangalore (12.9716, 77.5946)
- **Typical PM2.5:** 20–50 µg/m³
- **Expected AQI:** 65–120
- **Station Name:** Usually near Hebbal or Bapuji Nagar

### Hyderabad (17.3850, 78.4867)
- **Typical PM2.5:** 25–55 µg/m³
- **Expected AQI:** 75–130
- **Station Name:** Usually near Secunderabad or Kukatpally

### Jaipur (26.9124, 75.7873)
- **Typical PM2.5:** 40–90 µg/m³
- **Expected AQI:** 100–200
- **Station Name:** Usually "Jaipur - City Pulse"

## Component Data Flow Verification

### page.tsx → DataContext
1. **Component:** Calls `fetchAirQuality(place)`
2. **DataContext:** Invokes `openaqClient.getAirQualityData(placeId, lat, lng)`
3. **OpenAQClient:** Returns `AirQualityData` object
4. **Result:** Displayed in AQICard component

**Verify at Each Step:**
```typescript
// 1. In page.tsx:
console.log('[v0] page: Air quality data received', aqData);

// 2. In DataContext.tsx:
console.log('[v0] DataContext: fetchAirQuality returned', result);

// 3. In AQICard.tsx:
console.log('[v0] AQICard: Rendering with data', data);
```

## Network Request Verification

**In Browser DevTools → Network Tab:**

### First Load (Cache Miss)
```
GET /api/air-quality?lat=28.6139&lng=77.2090
Status: 200 OK
Response Time: 800-2000ms
```

**Response JSON:**
```json
{
  "success": true,
  "data": {
    "pm25": 45.2,
    "pm10": 67.8,
    "timestamp": "2026-03-01T12:30:00Z",
    "source": "openaq_real",
    "locationId": "uuid-123",
    "stationName": "New Delhi ITO"
  }
}
```

### Subsequent Loads (Cache Hit)
- No new network request to `/api/air-quality`
- Data comes from localStorage cache
- Console shows: `[v0] OpenAQ: Using cached data`

## Error Scenario Testing

### Scenario 1: No Internet Connection
1. Disable network in DevTools (offline mode)
2. Refresh page
3. **Expected:** Demo data shown, console shows fetch error

### Scenario 2: Invalid API Key
1. Set `OPENAQ_API_KEY` to invalid string in `.env.local`
2. Clear cache (localStorage)
3. Refresh page
4. **Expected:** 401 error, falls back to demo

### Scenario 3: Remote Location (No Stations)
1. Go to a rural area (e.g., coordinates with no monitoring stations)
2. Refresh page
3. **Expected:** 404 error, demo data fallback

## Performance Metrics to Check

| Metric | Expected | How to Measure |
|--------|----------|---|
| Cache hit time | <1ms | DevTools Performance tab |
| Demo data generation | <2ms | DevTools Console timing |
| Real API call | 800-2000ms | DevTools Network tab |
| Total first load | 3-5s | DevTools Performance tab |

## Automated Test Checklist

- [ ] Real data fetches with correct `dataSource: 'openaq_real'`
- [ ] PM2.5 and PM10 are within realistic ranges
- [ ] AQI is calculated correctly using EPA formula
- [ ] Hourly trend shows 24 data points
- [ ] Optimal windows are identified (AQI ≤ 100)
- [ ] Cache works for 30 minutes
- [ ] Rate limiting prevents spam after 5 seconds
- [ ] Demo fallback works on network errors
- [ ] Station name displays when available
- [ ] Coordinates are truncated to 4 decimals
- [ ] Radius is set to 10 km (not exceeding 25 km limit)

## Documentation Artifacts Created

1. **OPENAQ_IMPLEMENTATION.md** — Complete API documentation with examples
2. **OPENAQ_IMPLEMENTATION_DETAILS.md** — Architecture, data flow, and testing guide

## Rollback Instructions (If Needed)

If the new implementation has issues:

```bash
# Revert to previous version
git checkout HEAD -- app/api/air-quality/route.ts lib/api/openaq.ts

# Or manually:
# 1. Restore old OpenAQ v2 endpoints
# 2. Remove stationName/locationId fields
# 3. Set radius back to 50000 (will cause 422 errors)
```

## Next Steps

1. ✅ **Test in all five major Indian cities**
2. ✅ **Verify console logs match expected output**
3. ✅ **Check AQI calculations against manual math**
4. ✅ **Confirm caching and rate limiting work**
5. ✅ **Test network error scenarios**
6. ✅ **Verify demo data fallback**
7. ✅ **Monitor API quota usage**
