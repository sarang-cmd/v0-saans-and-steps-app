# Quick Start - Saans & Steps 🌬️

Get the app running in 2 minutes!

## 1️⃣ Installation (30 seconds)

```bash
# Install dependencies
pnpm install

# OR if you use npm:
npm install

# OR if you use yarn:
yarn install
```

## 2️⃣ Run Dev Server (10 seconds)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

That's it! 🎉 The app is fully functional.

## 3️⃣ What Works Out of Box

✅ Air quality data for 500+ Indian cities
✅ 7-day weather forecast
✅ Optimal workout windows calculation
✅ Multiple user profiles
✅ Light/Dark themes
✅ English & Hindi language support
✅ Offline mode (PWA)
✅ All features (free plan)

**Zero API keys required!**

## 4️⃣ Optional: Add Real Air Quality Data

Want live OpenAQ data instead of demo?

```bash
# Create .env.local in root directory
NEXT_PUBLIC_OPENAQ_API_KEY=your_free_key_here

# Get free key from: https://openaq.org/
```

Restart dev server and you'll see real data!

## 5️⃣ Test the Features

### Home Page (Today)
- See current AQI, weather, and optimal workout time
- Hourly trend charts

### Watch Page
- Add cities to monitor
- See multi-city comparison
- Real-time updates

### Planner Page
- 7-day forecast
- Best days for outdoor activities
- Weather predictions

### Profile Page
- Create multiple profiles
- Set respiratory sensitivity
- Switch themes and language
- (Optional) Upgrade to unlock more features

### Admin Panel
- Tap logo 7 times to unlock
- Test feature flags
- Grant entitlements
- Mock payments

## 6️⃣ Build & Deploy

### Build for Production
```bash
pnpm run build
pnpm start
```

### Deploy to Vercel (Recommended)
```bash
# Just push to GitHub and connect to Vercel
# It auto-deploys on every push!
```

### Deploy Anywhere
Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Netlify
- Docker
- Self-hosted
- Custom domains

## 7️⃣ Customize

### Change Colors
Edit `app/globals.css` - all colors use CSS variables

### Change Fonts
Add fonts to `public/fonts/` and update `lib/fonts.ts`

### Add Features
See existing components in `components/` and `contexts/` for patterns

### Add API Keys
Update `.env.local` with any service keys

## 🎓 File Structure

```
├── app/                  # Pages (home, watch, planner, etc)
├── components/           # Reusable UI components
├── contexts/             # State management (Theme, Language, etc)
├── lib/                  # Utilities, types, API clients
├── public/              # Static assets (fonts, icons)
├── .env.example         # Template for env variables
└── docs/                # Setup & deployment guides
```

## 🚀 Next Steps

1. ✅ Run `pnpm dev`
2. 📖 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. ✨ Explore [FEATURES_AND_TESTING.md](./FEATURES_AND_TESTING.md)
4. 🚀 Deploy with [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
5. 🎨 Customize as needed

## ❓ Common Questions

**Q: Can I run this without API keys?**
A: Yes! Everything works with demo data.

**Q: Is my data private?**
A: 100% - all data stays on your device by default.

**Q: Can I deploy for free?**
A: Yes - Vercel free tier is perfect for this.

**Q: How do I add new cities?**
A: App includes 500+ Indian cities. Can add custom coordinates in Watch page.

**Q: Can I use Firebase?**
A: Yes, optional. See SETUP_GUIDE.md for Firebase setup.

## 🎯 What to Explore

Start by exploring these pages:
1. **Home** - See how optimal windows are calculated
2. **Watch** - Add multiple cities
3. **Planner** - Check 7-day forecast
4. **Profile** - Create profiles, try themes/language
5. **Admin Panel** - Tap logo 7x to unlock QA features

## 💡 Pro Tips

- **Dark Mode**: Looks great! Toggle in top right
- **Hindi Mode**: Full translations! Try it out
- **Mobile**: Bottom nav shows on mobile
- **Offline**: Go offline and everything still works
- **Notifications**: Set reminders for workouts

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
pnpm dev -- -p 3001  # Use different port
```

**Dependencies failing?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript errors?**
```bash
# These are safe to ignore during dev
# They won't block your app from running
# Fix them before deploying to production
```

## 📚 Learn More

- [Full README](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Features & Testing](./FEATURES_AND_TESTING.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Next.js Docs](https://nextjs.org/)
- [React Docs](https://react.dev/)

---

**You're ready! Happy coding! 🚀**

Any issues? Check the troubleshooting section above or read the detailed guides.
