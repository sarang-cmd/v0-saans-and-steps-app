# Saans & Steps - Setup & Deployment Guide

## Quick Start

1. **Clone or download the project**
2. **Install dependencies**: `npm install` or `pnpm install`
3. **Set up environment variables** (see below)
4. **Run development server**: `npm run dev`
5. **Open browser**: http://localhost:3000

## Environment Variables Setup

### Step 1: Copy Environment File

```bash
cp .env.example .env.local
```

### Step 2: Configure APIs (All Free Tier)

#### OpenAQ (Air Quality Data)
- **What it does**: Real-time PM2.5, PM10, and NO2 air quality data for 500+ Indian cities
- **Setup**:
  1. Visit https://openaq.org/
  2. Click "Get API Key" (free tier available)
  3. Copy your API key
  4. Paste into `NEXT_PUBLIC_OPENAQ_API_KEY` in `.env.local`
- **Cost**: FREE (free tier available)
- **Note**: Free tier works without key but is rate-limited. With key, you get higher limits.

#### MET Norway Weather (Weather Data)
- **What it does**: Comprehensive weather forecasts for any location
- **Setup**: No API key required! The app uses the free MET Norway API directly
- **Cost**: FREE
- **Note**: Already configured and working

#### Firebase (Optional - Cloud Sync)
- **What it does**: Optional cloud backup and cross-device sync
- **Setup** (if you want it):
  1. Go to https://firebase.google.com/
  2. Click "Get Started"
  3. Create a new project
  4. Go to Project Settings
  5. Copy these values to `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Cost**: FREE (Spark plan)
- **Note**: Firebase is OPTIONAL. App works 100% without it

#### Stripe (Optional - Payments)
- **What it does**: Payment processing for premium plans
- **Setup** (if you want real payments):
  1. Go to https://stripe.com/
  2. Create account
  3. Get test API keys from Dashboard
  4. Add to `.env.local`:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
- **Cost**: FREE to get started, pay per transaction
- **Note**: App has mock payment system that works without this

## Environment Variables Reference

```env
# Air Quality API
NEXT_PUBLIC_OPENAQ_API_KEY=your_key_here  # Optional, leave blank for rate-limited free tier
NEXT_PUBLIC_OPENAQ_DEMO_MODE=false         # Set to true to use demo data

# Firebase (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Features Configuration

### Themes
Themes work automatically:
- Light/Dark mode switcher in top navigation
- Custom cursor themes with color matching
- Glassmorphism design adapts to theme
- All changes persist to localStorage

### Language/Bilingual Support
Hindi and English language support:
- Language switcher in top navigation
- All UI strings translated
- Persists language preference
- Auto-detect browser language

### Custom Fonts
Add custom fonts (optional):
1. Create folder: `public/fonts/`
2. Add font files: `public/fonts/custom.ttf`
3. Restart dev server
4. App auto-detects and loads custom font
5. Falls back to system fonts if not found

## Deployment to Vercel

### 1. Prepare Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel

# Option B: Using Vercel Dashboard
# Go to https://vercel.com/new
# Import your GitHub repository
# Vercel will detect Next.js and configure automatically
```

### 3. Set Environment Variables on Vercel
In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_OPENAQ_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - (and all other Firebase variables)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
4. Click "Save"
5. Redeploy project

### 4. Verify Deployment
- Visit your Vercel URL
- Check air quality data loads (green/orange/red indicators)
- Check weather data shows correctly
- Test payment system (uses mock data)

## Troubleshooting

### Air Quality Data Not Loading
- Check if `NEXT_PUBLIC_OPENAQ_API_KEY` is set
- If set, verify key is valid at https://openaq.org/
- Try setting `NEXT_PUBLIC_OPENAQ_DEMO_MODE=true` to use demo data
- Check browser console for errors (F12)

### Weather Not Showing
- MET Norway API is free and should work without setup
- Check network tab in browser dev tools
- Verify latitude/longitude are correct for your location

### Firebase Not Syncing
- Firebase is optional - app works without it
- If you want it, verify all 6 Firebase config variables are set
- Check Firebase Console for any errors

### Themes Not Persisting
- Clear browser cache and localStorage
- Try in incognito/private mode
- Restart dev server

### Hindi Text Not Showing
- Check if Hindi language selected in top navigation
- Verify browser supports Devanagari script
- Try clearing cache if text appears as boxes

## Advanced Configuration

### Using Demo Data
If you want to test without API keys:
```env
NEXT_PUBLIC_OPENAQ_DEMO_MODE=true
```

This loads realistic demo air quality data for testing.

### Custom API Rate Limits
OpenAQ free tier has these limits:
- 10 requests/hour without key
- 100 requests/hour with key
- App caches data to minimize requests

### Firebase Authentication
To enable user accounts:
1. Set Firebase variables in `.env.local`
2. Firebase automatically handles auth
3. Users can sign up with email/Google/GitHub

## Support & Resources

- **OpenAQ Docs**: https://docs.openaq.org/
- **MET Norway API**: https://www.met.no/en/free-products/api
- **Firebase Docs**: https://firebase.google.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## What's Free?

- MET Norway Weather API: ✅ 100% FREE
- OpenAQ: ✅ FREE tier available
- Firebase: ✅ FREE Spark plan (generous limits)
- Vercel Hosting: ✅ FREE tier available
- Stripe: ✅ FREE account (pay per transaction)

You can run the entire app with zero cost!
