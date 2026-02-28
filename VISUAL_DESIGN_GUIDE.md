# Saans & Steps - Visual Design Guide

## Apple-Inspired Glassmorphism Design System

This document describes the premium visual overhaul applied to Saans & Steps, featuring Apple-style glassmorphism, 3D effects, shaders, and custom typography.

### Color Palette

**Primary Colors (Indian Tricolor)**
- **Saffron**: `#FF9933` - Primary actions, highlights, sun elements
- **Green**: `#138808` - Secondary actions, growth, leaf elements
- **Blue**: `#0B7DBA` - Accent color, sky, additional highlights

**Neutrals**
- **Background Light**: `oklch(0.975 0.001 70)` - Off-white
- **Background Dark**: `oklch(0.12 0.01 280)` - Deep navy
- **Foreground**: Automatic contrast based on theme

### Glassmorphism Effects

#### Glass Card Component
```tsx
<GlassCard variant="default">
  Content here
</GlassCard>
```

**Variants:**
- `default` - Standard glass with light blur (20px)
- `strong` - Enhanced glass with stronger blur and border
- `subtle` - Minimal glass effect for secondary elements

**Features:**
- `backdrop-filter: blur(20px)` for frosted effect
- `background: rgba(255, 255, 255, 0.1)` with proper opacity
- `border: 1px solid rgba(255, 255, 255, 0.2)` for depth
- Smooth 300ms transitions on hover
- Scale transform (105%) on hover for interactive feedback
- Soft shadow for depth: `shadow-lg shadow-black/5`

### Custom Fonts System

#### How It Works

1. **Automatic Detection**: On page load, the app checks for custom fonts in `/public/fonts/`
2. **Graceful Fallback**: If fonts aren't found, uses system defaults automatically
3. **No Configuration Needed**: Everything is handled automatically

#### Adding Custom Fonts

1. Create `/public/fonts/` directory (already exists)
2. Add these files:
   - `custom.ttf` - Regular weight
   - `custom-bold.ttf` - Bold weight
   - `custom-italic.ttf` - Italic style

3. Supported formats: TTF, OTF, WOFF2, WOFF

#### Font Stack

```css
--font-custom: CustomFont, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
```

**Recommended fonts for Hindi + English:**
- Noto Sans (supports Devanagari)
- Poppins (geometric, modern)
- Inter (minimalist, professional)
- SF Pro Display (Apple aesthetic)

### Custom Cursor System

#### Available Themes

1. **Default** - Orange glow with outer ring
2. **Glow** - Soft glowing effect with trail
3. **Gradient** - Color gradient with movement
4. **Minimal** - Simple dot cursor
5. **Dot** - Tiny responsive circle

#### Implementation

```tsx
import { CursorThemeSwitcher } from '@/components/CursorThemeSwitcher';

// Add to layout - automatically renders cursor theme switcher
<CursorThemeSwitcher />
```

**Features:**
- Canvas-based custom rendering
- Trail effects for smooth movement
- Color matching to theme (saffron, green, blue)
- Persistent theme preference in localStorage
- Mouse click ripple effect

#### Cursor Colors

- **Default & Dot**: Saffron (`#FF9933`)
- **Gradient**: Green (`#138808`)
- **Minimal**: Blue (`#0B7DBA`)

### 3D Components & Shaders

#### 3D Loading Spinner
```tsx
<LoadingSpinner3D />
```
- Three concentric rotating rings (saffron, green, blue)
- SVG-based for performance
- Different rotation speeds for visual interest

#### 3D Torus Background
```tsx
<TorusBackground />
```
- Animated rotating rings
- Used in transitions and special screens
- Smooth mathematical animations

#### Enhanced Loading Screen
```tsx
<EnhancedLoadingScreen />
```
- Particle system animation
- Glassmorphic card container
- Canvas-based background effects
- Animated progress bar with gradient

### Shader Effects

#### Fragment Shaders
- **Wave Distortion**: Used in transitions
- **Noise-Based**: Organic flowing patterns
- **Glassmorphism**: Frosted glass refraction effect

#### Shader Implementation
Located in `/lib/shaders.ts`:
- VERTEX_SHADER: Wave distortion with time-based animation
- FRAGMENT_SHADER: Color mixing with shimmer effects
- NOISE_FRAGMENT_SHADER: Perlin noise simulation
- GLASS_FRAGMENT_SHADER: Frosted glass rendering

### Animation System

#### Keyframe Animations

**Available animations in CSS:**
- `fadeInScale` - Smooth scale-in from 95% to 100%
- `slideInUp` - Slide in from bottom with fade
- `slideInDown` - Slide in from top with fade
- `shimmer` - Horizontal shimmer effect
- `float` - Gentle up-down floating
- `glow` - Box-shadow pulsing effect
- `pulse-subtle` - Opacity pulsing

#### Tailwind Animation Classes

```html
<!-- Scale fade in -->
<div class="animate-fade-in-scale">Content</div>

<!-- Slide animations -->
<div class="animate-slide-in-up">Content</div>
<div class="animate-slide-in-down">Content</div>

<!-- Special effects -->
<div class="animate-float">Content</div>
<div class="animate-glow">Content</div>
<div class="animate-pulse-subtle">Content</div>
```

### Usage Examples

#### Glassmorphic Card
```tsx
<GlassCard variant="strong" className="px-6 py-4">
  <h2 className="text-xl font-bold">Premium Feature</h2>
  <p>Available with beautiful glass effect</p>
</GlassCard>
```

#### Loading State
```tsx
import { EnhancedLoadingScreen } from '@/components/EnhancedLoadingScreen';

<EnhancedLoadingScreen />
```

#### Custom Cursor
```tsx
// Automatically added to layout
// User can switch themes via floating button
```

#### 3D Spinner
```tsx
<LoadingSpinner3D />
```

### Performance Considerations

**Glassmorphism**
- Uses CSS `backdrop-filter` (GPU accelerated)
- Minimal performance impact on modern browsers
- Graceful degradation on older devices

**Custom Cursor**
- Canvas-based rendering at 60fps
- requestAnimationFrame for smooth animations
- Option to disable if needed

**3D Components**
- SVG-based (scalable, lightweight)
- HTML Canvas for animations
- No WebGL overhead unless explicitly used

**Animations**
- CSS-based where possible (GPU accelerated)
- Smooth 300ms transitions
- Reduced motion support via `prefers-reduced-motion`

### Browser Support

**Full Support:**
- Chrome 88+
- Safari 15+
- Firefox 95+
- Edge 88+

**Partial Support (Graceful Degradation):**
- iOS Safari 15+
- Chrome/Firefox on Android 88+

**No Support (Feature Disabled):**
- IE 11 and below
- Very old Safari versions

### Accessibility

**Considerations:**
- All animations respect `prefers-reduced-motion` setting
- Custom cursor can be disabled per user preference
- Text remains readable on glassmorphic backgrounds (sufficient contrast)
- Color not used as only means of information
- Keyboard navigation fully supported

### Dark Mode

All glassmorphism effects automatically adjust for dark mode:

**Light Mode:**
- Glass background: `rgba(255, 255, 255, 0.1)`
- Glass blur: `20px`

**Dark Mode:**
- Glass background: `rgba(0, 0, 0, 0.15)`
- Glass blur: `25px`

### File Structure

```
/public
  /fonts/
    README.md (instructions)
    custom.ttf (add your fonts here)
    custom-bold.ttf
    custom-italic.ttf

/lib
  cursor.ts (cursor manager)
  fonts.ts (font loader)
  shaders.ts (GLSL shaders)

/components
  GlassCard.tsx (glassmorphic container)
  CursorThemeSwitcher.tsx (cursor theme selector)
  FontInitializer.tsx (font loader)
  EnhancedLoadingScreen.tsx (loading with effects)
  /3D/
    LoadingSpinner3D.tsx (3D spinner)
    TorusBackground.tsx (animated torus)
```

### Customization

#### Change Primary Colors
Edit `/app/globals.css`:
```css
:root {
  --primary: #FF9933; /* Change this */
  --secondary: #138808; /* Change this */
  --accent: #0B7DBA; /* Change this */
}
```

#### Adjust Glassmorphism Blur
Edit glass values in globals.css:
```css
--glass-blur: blur(25px); /* Increase for stronger effect */
```

#### Add Custom Cursor Theme
Edit `/lib/cursor.ts` and add to `CURSOR_CONFIGS` object.

---

This design system creates a premium, modern experience while maintaining excellent accessibility and performance. The visual language is inspired by Apple's design principles while celebrating Indian cultural elements through the tricolor palette.
