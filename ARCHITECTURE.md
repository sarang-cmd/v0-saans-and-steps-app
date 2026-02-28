# Architecture Overview - Saans & Steps

Understanding the codebase structure and design patterns.

## 🏗️ Project Structure

```
saans-and-steps/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles & CSS variables
│   ├── page.tsx                 # Home page (Today screen)
│   ├── profile/page.tsx         # Profile & settings
│   ├── watch/page.tsx           # Multi-city monitoring
│   ├── planner/page.tsx         # 7-day forecast
│   ├── settings/page.tsx        # Notifications & reminders
│   └── firebase-setup/page.tsx  # Firebase configuration
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── 3D/                      # Three.js components
│   ├── Navigation.tsx           # Top & bottom nav
│   ├── ThemeSwitcher.tsx        # Theme selector
│   ├── LanguageSwitcher.tsx     # Language selector
│   ├── AdminPanel.tsx           # QA admin panel
│   ├── PaymentModal.tsx         # Payment flow
│   └── [other components]
│
├── contexts/                     # State management
│   ├── ThemeContext.tsx         # Light/Dark/Auto theme
│   ├── LanguageContext.tsx      # English/हिंदी language
│   ├── ProfileContext.tsx       # User profiles
│   ├── DataContext.tsx          # API data & caching
│   └── SettingsContext.tsx      # App settings
│
├── lib/                          # Utilities & helpers
│   ├── types.ts                 # TypeScript types
│   ├── i18n.ts                  # Translations
│   ├── admin.ts                 # Admin functionality
│   ├── payments.ts              # Payment mock
│   ├── notifications.ts         # Notification system
│   ├── api/                     # API clients
│   │   ├── openaq.ts           # Air quality API
│   │   ├── weather.ts          # Weather API
│   │   └── cities.ts           # Cities database
│   └── utils.ts                 # Utility functions
│
├── public/                       # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── fonts/                  # Custom fonts
│   └── icons/                  # App icons
│
├── docs/                         # Documentation
│   ├── README.md               # Project overview
│   ├── QUICK_START.md          # Quick setup
│   ├── SETUP_GUIDE.md          # API setup
│   ├── DEPLOYMENT_GUIDE.md     # Deployment
│   ├── FEATURES_AND_TESTING.md # Features
│   └── ARCHITECTURE.md         # This file
│
├── .env.example                # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── next.config.mjs             # Next.js config
```

## 🎯 Data Flow Architecture

### Page Load Sequence
```
1. Browser requests app
   ↓
2. Next.js renders layout.tsx
   ↓
3. Providers wrap children:
   - LanguageProvider (i18n)
   - ThemeProvider (Light/Dark/Auto)
   - ProfileProvider (User data)
   - DataProvider (API cache)
   ↓
4. Components render
   ↓
5. Service Worker registers
   ↓
6. App fully loaded
```

### Provider Hierarchy
```
<html>
  <body>
    <LanguageProvider>
      Language context for i18n
      ↓
      <ThemeProvider>
        Theme management
        ↓
        <ProfileProvider>
          User profiles state
          ↓
          <DataProvider>
            API data caching
            ↓
            <Pages & Components>
              ServiceWorker
              Navigation
              Notifications
            </Pages & Components>
          </DataProvider>
        </ProfileProvider>
      </ThemeProvider>
    </LanguageProvider>
  </body>
</html>
```

## 🔄 Data Flow Examples

### Getting Air Quality Data
```
1. User opens home page
   ↓
2. DataProvider checks cache
   - If cached & fresh: return cached data
   - If expired or missing: fetch new data
   ↓
3. OpenAQ API called:
   lib/api/openaq.ts → fetch()
   ↓
4. Response parsed & cached
   localStorage → DataProvider state
   ↓
5. Component renders with data
   AQICard shows real-time AQI
```

### Switching Theme
```
1. User clicks theme switcher
   ↓
2. ThemeSwitcher → useTheme() hook
   ↓
3. setTheme('dark')
   ↓
4. ThemeProvider updates:
   - Local state
   - localStorage ('app_theme')
   - HTML classList (.dark)
   ↓
5. CSS responds to .dark class
   document.documentElement.classList.add('dark')
   ↓
6. All components update visually
   (via Tailwind dark: utilities)
```

### Switching Language
```
1. User clicks language switcher
   ↓
2. LanguageSwitcher → useLanguage() hook
   ↓
3. setLanguage('hi')
   ↓
4. LanguageProvider updates:
   - Local state
   - localStorage ('app_language')
   - HTML lang attribute
   ↓
5. Context value changes
   ↓
6. All components re-render
   Using new language from translations
```

## 📦 State Management Pattern

### Context Usage
```typescript
// Creating a context
const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState();
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

// Using the context
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be inside MyProvider');
  return context;
}

// In components
function MyComponent() {
  const { state, setState } = useMyContext();
  return <>{state}</>;
}
```

## 🌐 API Architecture

### OpenAQ Integration
```typescript
// lib/api/openaq.ts
class OpenAQClient {
  async getAirQualityData(latitude, longitude) {
    // Check cache first
    // If fresh, return cached
    // If stale, fetch new
    // Store in localStorage
    // Return data
  }
}

// Usage
const openaq = new OpenAQClient();
const data = await openaq.getAirQualityData(28.6139, 77.2090); // Delhi
```

### Weather Integration
```typescript
// lib/api/weather.ts
class WeatherClient {
  async getForecast(latitude, longitude) {
    // Calls MET Norway API
    // Parses response
    // Calculates workout scores
    // Returns forecast data
  }
}
```

### Cities Database
```typescript
// lib/api/cities.ts
// 500+ Indian cities stored locally
// No API needed
// Instant search
const city = findCity('Delhi');
const { lat, lon } = city;
```

## 🔐 Security & SSR Safety

### Server-Side Rendering Issues
```typescript
// ❌ WRONG - Causes crash on server
class Manager {
  constructor() {
    localStorage.getItem('key'); // Error on server!
  }
}

// ✅ RIGHT - Safe SSR pattern
class Manager {
  constructor() {
    if (typeof window !== 'undefined') {
      localStorage.getItem('key'); // Only runs on client
    }
  }
  
  loadData() {
    if (typeof window === 'undefined') return; // Guard in methods too
    localStorage.getItem('key');
  }
}

// ✅ BEST - Lazy initialization
let instance: Manager | null = null;

export function getManager(): Manager {
  if (typeof window === 'undefined') {
    return new Manager(); // Return new on server
  }
  if (!instance) {
    instance = new Manager(); // Singleton on client
  }
  return instance;
}
```

## 🎨 Styling Architecture

### CSS Variables System
```css
/* app/globals.css */

:root {
  /* Colors */
  --primary: 255 127 0;        /* Saffron */
  --secondary: 59 130 246;     /* Blue */
  --accent: 249 115 22;        /* Orange */
  --background: 255 255 255;   /* White */
  --foreground: 0 0 0;         /* Black */
  
  /* Spacing */
  --radius: 0.5rem;
  
  /* Other values */
}

.dark {
  --background: 10 10 10;
  --foreground: 255 255 255;
  /* ... dark mode overrides */
}
```

### Tailwind Utilities
```typescript
// Using design tokens
<div className="bg-background text-foreground">
  Background changes with theme
</div>

// Using semantic classes
<div className="dark:bg-gray-950 dark:text-white">
  Auto switches in dark mode
</div>

// Responsive
<div className="md:grid md:grid-cols-2 lg:grid-cols-3">
  Responsive grid layout
</div>
```

## 🚀 Performance Optimizations

### Caching Strategy
```typescript
// API responses cached for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
  return cachedData.value;
}

// Fetch fresh data
const newData = await fetch(API);
localStorage.setItem(key, JSON.stringify({
  value: newData,
  timestamp: Date.now()
}));
```

### Code Splitting
```typescript
// Dynamic imports for 3D components
const LoadingSpinner3D = dynamic(() => import('./3D/LoadingSpinner3D'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### Image Optimization
```typescript
// Next.js Image component
<Image
  src="/banner.jpg"
  width={1200}
  height={600}
  priority={true} // For above-fold
  className="w-full h-auto"
/>
```

## 📱 Responsive Design Strategy

### Mobile-First Approach
```css
/* Base: Mobile styles */
.container {
  display: flex;
  flex-direction: column;
}

/* Tablet: Add side-by-side layout */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* Desktop: Optimize spacing */
@media (min-width: 1024px) {
  .container {
    gap: 2rem;
  }
}
```

### Responsive Components
```typescript
export function Navigation() {
  return (
    <>
      {/* Mobile navigation */}
      <BottomNav className="md:hidden" />
      
      {/* Desktop navigation */}
      <TopNav className="hidden md:block" />
    </>
  );
}
```

## 🔌 Component Patterns

### Compound Components
```typescript
// PaymentModal.tsx
export function PaymentModal({ children }) {
  return <Dialog>{children}</Dialog>;
}

PaymentModal.Header = CardHeader;
PaymentModal.Body = CardContent;
PaymentModal.Footer = CardFooter;

// Usage
<PaymentModal>
  <PaymentModal.Header>Choose Plan</PaymentModal.Header>
  <PaymentModal.Body>{plans}</PaymentModal.Body>
  <PaymentModal.Footer>{buttons}</PaymentModal.Footer>
</PaymentModal>
```

### Controlled Components
```typescript
// ThemeSwitcher.tsx
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme(); // Get from context
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to {theme === 'light' ? 'dark' : 'light'}
    </button>
  );
}
```

## 🔄 Update Patterns

### Local State
```typescript
const [formData, setFormData] = useState({ name: '' });
```

### Context State
```typescript
const { user, setUser } = useProfile();
```

### Server State (Optional)
```typescript
// With Firebase (optional)
const userData = await getFirestoreData('users', userId);
```

## 🧪 Testing Architecture

### Component Testing
```typescript
// Example test structure
describe('ThemeSwitcher', () => {
  it('should toggle theme', () => {
    render(<ThemeSwitcher />);
    expect(document.documentElement).not.toHaveClass('dark');
    
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement).toHaveClass('dark');
  });
});
```

## 🌍 Internationalization (i18n)

### Translation System
```typescript
// contexts/LanguageContext.tsx
const translations = {
  en: { 'key': 'English text' },
  hi: { 'key': 'हिंदी पाठ' },
};

// Usage
const { t } = useLanguage();
return <h1>{t('home.title')}</h1>;
```

### Language Detection
```typescript
// Auto-detect from browser
const browserLang = navigator.language.split('-')[0];
const defaultLang = browserLang === 'hi' ? 'hi' : 'en';
```

## 🎯 Extension Points

### Adding a New Feature
```typescript
// 1. Create context (if needs global state)
// 2. Add provider to layout.tsx
// 3. Create component that uses context
// 4. Add to appropriate page

// Example: Adding a new page
// app/new-feature/page.tsx
export default function NewFeaturePage() {
  const { data } = useData();
  return <div>{data}</div>;
}
```

### Adding a New API
```typescript
// lib/api/new-service.ts
class NewServiceClient {
  async getData() {
    // Fetch from API
    // Cache result
    // Return data
  }
}

// lib/api/index.ts
export const newService = new NewServiceClient();

// In components
const data = await newService.getData();
```

## 🚀 Deployment Considerations

### Build Process
```bash
# Next.js handles:
# 1. Code bundling
# 2. Tree shaking
# 3. Minification
# 4. Image optimization
# 5. Static pre-rendering

pnpm run build
# Creates .next/ directory with optimized code
```

### Environment Variables
```bash
# .env.local - local only
# .env.production - production only
# NEXT_PUBLIC_* - visible to frontend

# All optional - app works without any env vars
```

## 📊 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (uses ES2020 features)

## 🎓 Learning Path

### Understanding the Flow
1. Read this file (ARCHITECTURE.md)
2. Read app/layout.tsx - understand provider nesting
3. Read a context (ThemeContext.tsx) - understand state management
4. Read a page (app/page.tsx) - understand component composition
5. Read a component (ThemeSwitcher.tsx) - understand component patterns

### Making Changes
1. Find relevant context/component
2. Understand current implementation
3. Make changes following existing patterns
4. Test with `pnpm dev`
5. Build with `pnpm build`

---

**Architecture is clean, scalable, and follows React best practices!** 🎯
