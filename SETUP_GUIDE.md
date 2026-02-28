# Saans & Steps - Setup Guide

Complete guide to configure APIs, themes, and language settings.

## Quick Start (Works Out of Box)

The app works perfectly without any API keys! It uses:
- **OpenAQ**: Free tier (no key required, rate-limited)
- **MET Norway Weather**: Completely free, no authentication
- **Demo data**: Fallback with realistic Indian city data
- **Local storage**: All data stays on your device by default

## Optional: Add OpenAQ API Key

Get real-time air quality data with your own API key.

### Step 1: Sign up for OpenAQ
1. Go to https://openaq.org/
2. Click "Get API Key" in the navigation
3. Sign up with your email
4. Verify your email
5. Copy your API key

### Step 2: Add to `.env.local`
```bash
# In the root directory, create or edit .env.local
NEXT_PUBLIC_OPENAQ_API_KEY=your_api_key_here
NEXT_PUBLIC_OPENAQ_DEMO_MODE=false
```

### Step 3: Restart Dev Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart
pnpm dev
```

You'll now see real air quality data for all Indian cities!

## Optional: Firebase Setup

Firebase is completely optional. Use it only if you want:
- Cloud data backup
- Cross-device sync
- User authentication

### Step 1: Create Firebase Project
1. Go to https://firebase.google.com/
2. Click "Create a project"
3. Enter project name: `saans-steps`
4. Accept terms and continue
5. Disable Google Analytics (optional)
6. Click "Create project" and wait

### Step 2: Get Configuration
1. In Firebase console, go to "Project settings" (gear icon)
2. Under "Your apps", click "Web"
3. Register app with name `saans-steps`
4. Copy the configuration object

### Step 3: Add to `.env.local`
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=app_id
```

The app will automatically detect and use Firebase when configured.

## Themes

Themes are built-in and work out of box:

### Available Themes
- **Light**: Clean light mode with saffron accents
- **Dark**: Dark mode with adjusted glassmorphism
- **Auto**: Follows system preference

### Switch Theme
1. Top right corner - look for theme toggle
2. Select preferred theme
3. Preference saves automatically

## Language Support

### Available Languages
- **English**: Default
- **हिन्दी (Hindi)**: Full UI translation

### Switch Language
1. Top navigation - look for language switcher
2. Click to toggle between English and Hindi
3. All UI elements update instantly
4. Preference saves to your profile

## Custom Fonts (Advanced)

Add custom fonts to personalize the app:

### Step 1: Add Font Files
1. Create fonts folder (if not exists): `public/fonts/`
2. Add your font files:
   - `custom.ttf`
   - `custom-bold.ttf`
   - `custom-italic.ttf`
   - Supported formats: TTF, OTF, WOFF, WOFF2

### Step 2: Update Font Config
Edit `lib/fonts.ts` to include your custom fonts:

```typescript
// In the loadCustomFonts function
const fontFile = await fetch('/fonts/custom.ttf');
```

### Step 3: Restart Dev Server
```bash
pnpm dev
```

Font will automatically load and apply system-wide.

## Cursor Themes

Custom cursor themes are available:

### Available Cursor Themes
1. **Default**: Saffron glow with trail effect
2. **Glow**: Bright glowing circle
3. **Gradient**: Multi-colored gradient effect
4. **Minimal**: Clean dot cursor
5. **Dot**: Simple round dot

### Switch Cursor Theme
1. Look for cursor switcher (usually top right)
2. Select preferred theme
3. Cursor changes instantly
4. Preference saves automatically

## Troubleshooting

### "Cannot fetch OpenAQ data"
- **Solution**: API key not set or invalid
- Check `.env.local` has correct `NEXT_PUBLIC_OPENAQ_API_KEY`
- App will automatically fall back to demo data
- No action needed - demo mode works perfectly!

### "Firebase not connecting"
- **Solution**: Configuration incomplete or incorrect
- Double-check all Firebase keys in `.env.local`
- Firebase is optional - app works without it
- If issues persist, remove Firebase keys and use local-only mode

### "Themes not switching"
- **Solution**: Clear browser cache (Ctrl+Shift+Delete)
- Remove localStorage: Open DevTools > Application > Clear Storage
- Reload page
- Preferences will reset but app will work fine

### "Hindi text not showing"
- **Solution**: Font might not support Devanagari
- App includes fallback fonts for Hindi
- Try switching to another theme or language
- Clear browser cache and retry

## Performance Tips

1. **Reduce API calls**: Demo mode caches data for 1 hour
2. **Use browser offline**: App works completely offline
3. **Enable PWA**: Install as app for better performance
4. **Clear old data**: Periodically clear browser cache

## Next Steps

1. ✅ Basic setup complete - start using the app!
2. (Optional) Add OpenAQ API key for real data
3. (Optional) Set up Firebase for cloud sync
4. Customize themes and language preferences
5. Invite family members to your profile

## Support

- 📚 API Docs: https://docs.openaq.org/
- 🔥 Firebase Docs: https://firebase.google.com/docs
- 🌦️ Weather Docs: https://api.met.no/weatherapi/documentation
- 💬 Issues? Check the troubleshooting section above
