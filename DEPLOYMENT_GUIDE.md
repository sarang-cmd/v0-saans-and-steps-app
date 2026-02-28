# Saans & Steps - Deployment Guide

Deploy your Saans & Steps app to Vercel, Netlify, or any Node.js hosting.

## Quickest: Deploy to Vercel (Recommended)

Vercel is the easiest and provides the best experience for Next.js apps.

### Prerequisites
- GitHub account with your repo pushed
- Vercel account (free)

### Step 1: Connect to Vercel
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Find `v0-saans-and-steps-app` repo
5. Click "Import"

### Step 2: Configure Environment Variables
1. Under "Environment Variables", add:
   - `NEXT_PUBLIC_OPENAQ_API_KEY` (optional - app works without)
   - `NEXT_PUBLIC_OPENAQ_DEMO_MODE=false` (optional)
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (optional)
   - (Add other Firebase keys if needed)

2. Click "Deploy"

### Step 3: Done!
Your app is live at `https://v0-saans-and-steps-app.vercel.app`

Advanced users can set up:
- Custom domain
- CI/CD workflows
- Analytics

## Alternative: Deploy to Netlify

### Step 1: Connect to Netlify
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Connect GitHub
4. Select `v0-saans-and-steps-app`
5. Configure build:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`

### Step 2: Environment Variables
In Netlify dashboard:
1. Go to "Site settings" → "Build & deploy"
2. Add environment variables:
   - `NEXT_PUBLIC_OPENAQ_API_KEY`
   - Firebase keys (optional)

### Step 3: Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Your app is live!

## Self-Hosted: Docker

Deploy on your own server with Docker.

### Step 1: Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### Step 2: Build and Run
```bash
# Build image
docker build -t saans-steps .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_OPENAQ_API_KEY=your_key \
  saans-steps
```

## Environment Variables for Production

Create `.env.local` with:

```bash
# OpenAQ (Free, Optional)
NEXT_PUBLIC_OPENAQ_API_KEY=your_key_here
NEXT_PUBLIC_OPENAQ_DEMO_MODE=false

# Firebase (Optional - for cloud features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (Optional - for real payments)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_public_key
STRIPE_SECRET_KEY=your_secret_key

# App Config
NODE_ENV=production
```

## Performance Optimization

### Enable Caching
Add to deployment config:

```yaml
# vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "max-age=3600" }
      ]
    }
  ]
}
```

### Enable PWA
App includes PWA support for offline usage:
1. Install as app from browser
2. Works completely offline
3. Syncs when online

## Monitoring

### Vercel Analytics (Recommended)
1. Go to project settings
2. Enable "Web Analytics"
3. Monitor real user performance

### Custom Logging
The app logs errors to browser console - monitor these in production.

## Custom Domain

### Vercel
1. Project settings → "Domains"
2. Add your domain
3. Follow DNS instructions
4. Usually propagates in minutes

### Netlify
1. Site settings → "Domain management"
2. Add custom domain
3. Update DNS records
4. Done!

## SSL/TLS

Both Vercel and Netlify provide free SSL certificates automatically.

For self-hosted:
- Use Let's Encrypt (free)
- Configure nginx/Apache to use certificates

## Backup & Data

Since app uses localStorage:
1. User data stays on their device
2. No backend database needed
3. Users can export data via settings
4. Firebase sync is optional

## Troubleshooting

### Build fails: "Cannot find module"
```bash
# Clear cache and rebuild
rm -rf node_modules
rm -rf .next
pnpm install
pnpm run build
```

### "Module not found" after deploy
- Check all environment variables are set
- Verify `.env.local` syntax
- Ensure API keys are correct

### App too slow
- Enable HTTP/2 caching
- Use CDN (Vercel/Netlify provide this)
- Optimize images
- Enable PWA for offline caching

### Large initial load
- App is ~500KB gzipped (normal for Next.js app)
- PWA caches for fast repeat visits
- Consider lazy loading non-critical features

## Scaling

The app is designed to scale:
- No backend database needed initially
- Firebase can be added later for persistence
- CDN distribution (automatic on Vercel/Netlify)
- Serverless functions for optional features

## Next Steps

1. ✅ Deploy to Vercel (easiest)
2. Add custom domain
3. Configure analytics
4. Set up Firebase (optional)
5. Monitor performance

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Docker Docs**: https://docs.docker.com/

Your app is now live and accessible worldwide!
