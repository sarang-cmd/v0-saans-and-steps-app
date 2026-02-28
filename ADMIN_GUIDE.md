# Admin Panel & Glassmorphism Guide

## Unlocking Admin Mode

The app includes a hidden admin panel for QA testing and feature control. To activate it:

1. **Tap the Logo 7 Times**
   - Go to any page
   - Click/tap the "Saans & Steps" logo in the top-left corner rapidly 7 times
   - Once unlocked, you'll see a blue ⚙️ button in the bottom-right corner

2. **Keyboard Shortcut** (After unlocking)
   - Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac) to toggle the admin panel

## Admin Panel Features

### Overview Tab
- View current theme (light/dark)
- Check admin mode status
- Toggle Glassmorphism design instantly
- View current app settings

### Features Tab
- Toggle feature flags on/off
- Control experimental features
- Manage beta functionality
- Instant app behavior changes (no refresh needed)

### Grants Tab
- Grant subscription plans (free, no-ads, pro, max)
- Each grant lasts 30 days
- Test premium features without payment
- Perfect for QA testing

### Payments Tab
- Test payment flow in mock mode
- Simulate transaction scenarios
- Debug payment integration

### Settings Tab
- Glassmorphism toggle with visual indicator
- Quick access to design mode
- Keyboard shortcut reference (Ctrl+Shift+A)

## Glassmorphism Design Mode

Glassmorphism is a modern design trend inspired by Apple's Human Interface Guidelines. It features:

### What Is Glassmorphism?
- Translucent glass-like surfaces
- Blurred background effect (backdrop filter)
- Subtle borders with soft transparency
- Soft shadows and depth effects
- Modern, premium feel

### How to Enable

**Method 1: Admin Panel**
1. Unlock admin mode (tap logo 7 times)
2. Click the blue ⚙️ button (bottom-right)
3. Go to "Overview" tab
4. Click "Enable Glassmorphism"

**Method 2: Settings Tab**
1. Unlock admin mode
2. Open admin panel (Ctrl+Shift+A)
3. Go to "Settings" tab
4. Toggle the switch for "Glassmorphism Design"

### Visual Changes
When enabled, the glassmorphism mode:
- Makes cards and panels transparent with backdrop blur
- Adds subtle glass effect to buttons
- Creates depth with semi-transparent backgrounds
- Enhances hover states with smooth transitions
- Works in both light and dark modes

### Keyboard Shortcut
Once unlocked, use `Ctrl+Shift+A` to quickly toggle the admin panel on/off

## Testing Feature Flags

Feature flags allow you to test functionality before it's released:

1. Open Admin Panel → Features tab
2. Locate the flag you want to test
3. Click ON/OFF button to toggle
4. The app responds immediately (no page refresh)
5. Current flags include:
   - `beta_features`: Enable experimental features
   - `new_ui`: Test new interface changes
   - `offline_mode`: Test offline functionality
   - `dark_theme`: Force dark theme
   - And more...

## Testing Subscriptions

To test premium features without payment:

1. Open Admin Panel → Grants tab
2. Select a plan: free, no-ads, pro, or max
3. Click the button to grant the plan
4. You'll receive a 30-day trial
5. Access premium features immediately
6. Test all paid functionality

## Navigation Changes

Buttons are now better organized:

### Top Navigation (Desktop)
- **Left Side**: Main navigation (Today, Planner, Watch, Profile)
- **Right Side**: Theme Switcher and Language Switcher (spaced out)
- Better visual hierarchy and spacing

### Mobile Navigation (Bottom)
- Unchanged for mobile-first design
- 4 main sections across the bottom

## Troubleshooting

### Admin Panel Not Appearing?
- Tap the logo 7 times (you may need to do it faster)
- The icon should appear in the bottom-right corner
- Refresh the page if needed

### Glassmorphism Not Working?
- Ensure your browser supports CSS backdrop-filter
- Works on Chrome, Safari, Edge, and Firefox
- Some older browsers may not support it fully

### Can't Find a Button?
- Some controls have moved to the Settings tab in Admin Panel
- The top navigation now has better spacing
- Check the Profile/Settings page for app-wide settings

## Demo Accounts

The app comes with demo data:
- No account creation needed
- All features available in demo mode
- Use admin panel to test premium features
- Data resets on refresh (no persistence in demo)

## Resetting Settings

To reset all settings:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page

This clears all admin settings, feature flags, and preferences.

## More Help

For detailed feature documentation, see:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Initial setup
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [FEATURES_AND_TESTING.md](./FEATURES_AND_TESTING.md) - Full feature list
