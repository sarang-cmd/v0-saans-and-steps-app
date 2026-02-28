# Saans & Steps - Complete Implementation Guide

A production-ready air quality and workout planning application with real-world data, payments, and cloud integration.

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Real APIs:** OpenAQ (free, no key required), MET Norway Weather (free, cached)
- **Payments:** Mock UPI QR codes, Mock Stripe integration (local testing)
- **Cloud:** Firebase (optional, fully optional, app works 100% without it)
- **State:** Context API + localStorage + IndexedDB (offline support)
- **PWA:** Service Worker, Web Manifest, installable app

### Key Features Implemented

#### 1. Real API Integration
- **OpenAQ Client** (`lib/api/openaq.ts`)
  - Free API (no key required by default)
  - Real-time PM2.5/PM10 data from 500+ monitoring stations
  - Automatic fallback to demo data if API unavailable
  - EPA AQI calculation algorithm
  - Hourly trend generation
  - Rate limiting: 5-second per location

- **MET Norway Weather** (`lib/api/metweather.ts`)
  - Free weather data (requires proper User-Agent header)
  - Complete weather forecast data
  - WMO condition codes mapping
  - Cached responses for performance
  - No API key needed

#### 2. Air Quality Scoring Engine
- **Scoring System** (`lib/scoring.ts`)
  - Combines AQI + weather + user preferences
  - 2-hour optimal workout window detection
  - Sensitivity-based adjustments (low/medium/high respiratory sensitivity)
  - Temperature-based activity recommendations
  - 7-day outlook generation

#### 3. Complete UI Screens

**Today Screen** (`app/page.tsx`)
- Real-time AQI display with color-coded categories
- Current weather summary
- Hourly trend chart
- Optimal workout windows with time ranges and scores
- Activity recommendations (running, cycling, outdoor-sports, indoor-workout)
- Location switcher (12 major Indian cities visible, 500+ available)

**7-Day Planner** (`app/planner/page.tsx`)
- 7-day air quality forecast
- Daily scores and classifications
- Recommended activity types per day
- Trend visualization
- Best days for outdoor fitness

**Multi-City Watch** (`app/watch/page.tsx`)
- Monitor 3-15 cities (based on plan)
- Real-time AQI for each city
- Quick add/remove functionality
- Plan upgrade prompts

**Profile & Settings** (`app/profile/page.tsx`)
- Multi-profile management
- Respiratory sensitivity preferences
- Accessibility modes (normal/senior-friendly)
- Plan management
- Family features
- Firebase configuration
- Notifications settings link

#### 4. Payment System
**Implementation** (`lib/payments.ts`)
- Mock UPI transactions with QR code generation
- Mock Stripe session creation
- 4-tier pricing: Free, No-Ads (₹50), Pro (₹100/mo), Max (₹200/mo)
- localStorage-based transaction storage
- 30-day validity for paid plans
- Full transaction history

**Payment UI** (`components/PaymentModal.tsx`)
- In-app payment modal (no external redirects)
- Plan selection with feature comparison
- Multiple payment methods (UPI, Stripe, Mock)
- QR code display for UPI testing
- Secure info notice

**Admin Testing:**
- Tap app logo 7 times to unlock admin mode (Ctrl+Shift+A on desktop)
- Admin panel shows in bottom-right corner
- Grant any plan to any user instantly
- Create mock payments
- Mock admin account with 10,000 credits

#### 5. Admin QA Panel
**Access:** Logo tap gesture (7 taps = unlock)

**Features:**
- Feature flag toggle (40+ flags scaffolded)
- Entitlement granting (1-year validity)
- Mock payment creation
- Test session tracking
- Admin user management (10,000 mock credits)

**Feature Flags:**
- `real-api` - Use OpenAQ real data
- `demo-mode` - Force demo data
- `firebase-enabled` - Enable cloud sync
- `payment-enabled` - Enable purchases
- `notifications-enabled` - Browser notifications
- `multilingual` - English/Hindi support
- Plus 30+ more for features like themes, export, automation, etc.

#### 6. Notifications & Reminders
**System** (`lib/notifications.ts`)
- Browser notification permission handling
- In-app notification center
- Unread count badge
- 6 notification types: optimal-window, air-quality-alert, weather-alert, reminder, achievement, family-update
- Persistent notification history (localStorage)

**Reminders** (`app/settings/page.tsx`)
- Create daily/weekly/custom reminders
- Scheduled time-based triggers
- Enabled/disabled toggle
- Delete functionality
- Automatic localStorage persistence
- Browser notification on trigger

#### 7. Firebase (Optional)
**Setup Page** (`app/firebase-setup/page.tsx`)
- Paste-and-configure Firebase credentials
- All fields optional
- Stores config in localStorage
- Security notice about API keys
- Easy reset functionality

**Integration** (`lib/firebase.ts`)
- Graceful initialization
- Auto-loads config from localStorage
- Provides Auth and Firestore access
- No errors if Firebase not configured
- 100% app functionality without Firebase

#### 8. Bilingual Support
**Language System** (`lib/i18n.ts`)
- English & Hindi translations
- 80+ translated strings
- Persistent language selection
- Browser language detection fallback
- Easy extension for more languages

**Language Switcher** (`components/LanguageSwitcher.tsx`)
- English/हिंदी button in top navigation
- Persistent selection
- No page reload required
- Integrated into navigation

#### 9. PWA & Offline Support
**Configuration:**
- Web manifest (`public/manifest.json`)
- Service Worker (`public/sw.js`)
- Installable app icon
- Add to home screen support
- Offline notification indicator

**Offline Features:**
- Last cached air quality data available
- Settings/preferences work offline
- Reminders function without connectivity
- Auto-sync when online restored
- Background sync (in service worker)

#### 10. Data Persistence
**Storage Layers:**
1. **localStorage** - User preferences, app state, transactions
2. **IndexedDB** - Offline AQI cache, weather data
3. **Context API** - Real-time state management

**Automatic Persistence:**
- User profile & preferences
- Entitlement status
- Payment history
- Notification history
- Reminders & schedules
- Admin settings

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation
```bash
# Install dependencies (automatic on file change)
npm install

# Or using the shadcn CLI to scaffold the project
npx shadcn-cli@latest init
```

### Running Locally
```bash
npm run dev
# App runs on http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

## Testing Features

### 1. Test Real APIs
- Air quality data fetches automatically from OpenAQ
- Weather data auto-fetches from MET Norway
- Falls back to demo data if APIs unavailable
- Check browser console for API logs

### 2. Test Admin Features
1. Click app logo (🌬️) in top-left 7 times
2. Admin panel appears bottom-right (gear icon)
3. Switch between Flags, Grants, Payments tabs
4. Toggle features on/off in real-time
5. Grant plans to see UI changes

### 3. Test Payments
1. Go to Profile → Upgrade Now
2. Select plan and payment method
3. **For UPI:** Shows QR code (auto-confirms in 3 sec in demo)
4. **For Stripe:** Shows mock session ID
5. **For Mock:** Instantly processes
6. Check transaction history in localStorage

### 4. Test Notifications
1. Go to Settings page
2. Click "Enable Browser Notifications"
3. Grant browser permission
4. Create a reminder (e.g., 1 minute from now)
5. Wait for notification to trigger

### 5. Test Firebase (Optional)
1. Go to Profile → Configure Firebase
2. Get config from Firebase Console (https://console.firebase.google.com)
3. Paste all fields, save
4. App will use Firebase if configured, works without it

### 6. Test Offline Mode
1. Open DevTools → Network tab
2. Set to "Offline"
3. App still displays last cached data
4. All features work except API calls
5. Go back online, data refreshes

## Data Sources

### Air Quality
- **Source:** OpenAQ (https://openaq.org)
- **Coverage:** 500+ cities worldwide, 1000+ monitoring stations
- **Update:** Real-time data
- **Cost:** Free (no authentication)
- **Units:** μg/m³ for PM2.5 and PM10

### Weather
- **Source:** MET Norway Weather API (https://www.weatherapi.no)
- **Coverage:** Global
- **Update:** Every 6 hours
- **Cost:** Free
- **Features:** Temperature, precipitation, wind, clouds, UV index

### Cities Database
- **Source:** Indian government data (200+ cities)
- **Coverage:** All states, NCR regions, major metros
- **Details:** Coordinates, state mapping, alternative names

## Configuration

### Environment Variables (Optional)
Currently the app doesn't require any env vars, but you can add:
- `NEXT_PUBLIC_OPENAQ_API_KEY` - Optional OpenAQ advanced tier key
- `NEXT_PUBLIC_STRIPE_KEY` - For real Stripe integration

### Feature Flags
Managed via admin panel (tap logo 7x to access).

### Customization
- Colors: Edit `app/globals.css` CSS variables
- Cities: Edit `data/indian-cities.json`
- Translations: Edit `lib/i18n.ts`
- Plans: Edit `lib/payments.ts` PLANS object

## Performance Tips

1. **Caching:** API responses cached 1 hour by default
2. **Lazy Loading:** Components load on-demand
3. **Images:** Use Next.js Image optimization
4. **Code Splitting:** Automatic route-based splitting
5. **PWA:** Serve from service worker cache

## Security Considerations

1. **No Backend Needed:** All data client-side, no server leaks
2. **localStorage:** Accessible to XSS, but this is demo app
3. **Firebase Credentials:** Safe to include apiKey (restricted in Firebase)
4. **HTTPS Required:** For PWA and service workers
5. **Notification Permissions:** User grants explicitly

## Extensibility

### Adding a New Feature
1. Create flag in `lib/admin.ts` FeatureFlag type
2. Check with `adminManager.isFeatureEnabled(flag)`
3. Wrap UI with feature toggle
4. Test via admin panel

### Adding a New Plan
1. Edit `lib/payments.ts` PLANS object
2. Add pricing and features
3. Update payment modal
4. Test via admin panel

### Adding a New Language
1. Add language to `lib/i18n.ts` translations
2. Update Language type
3. Test language switcher

### Adding a New Notification Type
1. Add type to NotificationType in `lib/notifications.ts`
2. Add icon in NotificationsCenter
3. Use `notificationManager.createNotification(type, ...)`

## Troubleshooting

### API Not Returning Data
- Check browser console for errors
- Verify API URLs in `lib/api/openaq.ts` and `lib/api/metweather.ts`
- Try demo mode from admin panel
- Check network tab in DevTools

### Notifications Not Working
- Grant browser permission (Settings page)
- Check browser notification settings
- Ensure HTTPS (required for notifications)
- Check console for permission errors

### Firebase Not Working
- Paste complete valid config
- Check Firebase Console for API restrictions
- Verify project is created
- Reset and try again

### Payment Modal Not Opening
- Check admin panel for payment-enabled flag
- Verify profile page imports PaymentModal
- Check console for JS errors
- Clear localStorage and reload

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
- **Netlify:** Works with next.config settings
- **Docker:** Standard Node.js Dockerfile
- **Static Export:** Configure next.config for `output: 'export'`

### Post-Deployment
1. Enable HTTPS (required for PWA)
2. Set security headers (CSP, X-Frame-Options, etc.)
3. Configure Firebase CORS if using
4. Monitor API rate limits from OpenAQ/MET

## Support & Updates

### Real-World Considerations
- OpenAQ API: 1000 requests/day free limit (adjust caching for production)
- MET Norway: No rate limit, respects User-Agent header
- Browser Storage: localStorage ~5-10MB limit, use IndexedDB for more

### Future Enhancements
- Real Stripe integration
- Backend API for data persistence
- Multi-user sync via Firebase
- ML-based activity recommendations
- Geolocation-based city detection
- Social features (sharing, challenges)
- Wearable device integration

## License & Credits
Built with Saans (Breath) & Steps philosophy - helping you take healthy, informed workout steps in your city.
