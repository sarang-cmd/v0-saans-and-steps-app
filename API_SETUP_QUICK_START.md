# Quick Start: Setting Up APIs

## TL;DR - The App Works Immediately

No API keys required! The app uses:
- **MET Norway Weather**: Free, no setup
- **OpenAQ Demo Mode**: Free demo data enabled by default

You can use the app right now with demo data. Want real data? Follow below.

## Adding Real Air Quality Data (2 minutes)

### Option A: Free Tier (Easiest)
OpenAQ provides free data without needing an API key:
```
# In .env.local, leave this blank:
NEXT_PUBLIC_OPENAQ_API_KEY=
```
This works but is rate-limited to 10 requests/hour. Perfect for testing.

### Option B: With API Key (Best)
1. Visit https://openaq.org/
2. Click "API" → "Get Started"
3. Create a free account
4. Generate API key (under Dashboard → API Keys)
5. In your project, create `.env.local`:
```
NEXT_PUBLIC_OPENAQ_API_KEY=your_key_here
NEXT_PUBLIC_OPENAQ_DEMO_MODE=false
```
6. Restart dev server: `npm run dev`

Now you get real air quality data with 100 requests/hour!

## Weather Data (Already Working)
MET Norway Weather is already fully functional - no setup needed!
- Real-time forecasts for any location
- No API key required
- Completely free

## Testing with Demo Data
To quickly test with realistic demo data:
```
NEXT_PUBLIC_OPENAQ_DEMO_MODE=true
```
This shows fake but realistic air quality readings.

## Optional: Firebase Cloud Sync
If you want cloud backup:
1. Go to https://firebase.google.com/
2. Create new project (free Spark plan)
3. Get config from Project Settings
4. Add to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
(etc - see .env.example)
```

Firebase is completely optional - app works 100% offline.

## Optional: Stripe Payments
For real payment processing:
1. Go to https://stripe.com/
2. Create account
3. Get test API keys from Dashboard
4. Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

App has mock payment system that works without this.

## Done! Start Using:
```bash
npm run dev
# Visit http://localhost:3000
```

That's it! Choose your cities and see real air quality + weather data.

## What Works Right Now:
✅ Air Quality (demo or real with API key)
✅ Weather Forecasts (free, already working)
✅ Theme Switcher (light/dark/system)
✅ Hindi Language Support
✅ Custom Fonts (drop in public/fonts/)
✅ Offline Functionality
✅ Payment System (mock or real with Stripe)
✅ Admin Panel (tap app logo 7x to unlock)

## Troubleshooting:
- **Data not loading?** Check browser console (F12) for errors
- **API key not working?** Verify key is correct at openaq.org
- **Theme not changing?** Try incognito mode, clear cache
- **Hindi not showing?** Requires browser with Devanagari support

For full details see: `SETUP_AND_DEPLOYMENT.md`
