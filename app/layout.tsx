import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { DataProvider } from '@/contexts/DataContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { TopNavigation, BottomNavigation } from '@/components/Navigation'
import { OfflineNotification, ServiceWorkerRegister } from '@/components/OfflineNotification'
import { NotificationsCenter } from '@/components/NotificationsCenter'
import { CursorThemeSwitcher } from '@/components/CursorThemeSwitcher'
import { FontInitializer } from '@/components/FontInitializer'
import { ThemeShortcutHandler } from '@/components/ThemeShortcutHandler'
import { AnalyticsWrapper } from '@/components/Analytics'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: '--font-geist-sans' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Saans & Steps - Air Quality & Workout Planner',
  description: 'Find the perfect time to workout based on air quality and weather. Real-time AQI data and personalized workout recommendations for Indian cities.',
  generator: 'v0.app',
  keywords: ['air quality', 'workout', 'fitness', 'AQI', 'weather', 'India', 'health'],
  authors: [{ name: 'Saans & Steps' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Saans & Steps',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF9933',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${_geist.variable} ${_geistMono.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground" suppressHydrationWarning>
        <FontInitializer />
        <ThemeShortcutHandler />
        <LanguageProvider>
          <ThemeProvider>
            <ProfileProvider>
              <DataProvider>
                <ServiceWorkerRegister />
                <OfflineNotification />
                <NotificationsCenter />
                <TopNavigation />
                <main className="md:pt-20 md:pb-0 pb-24">
                  {children}
                </main>
                <BottomNavigation />
                <CursorThemeSwitcher />
              </DataProvider>
            </ProfileProvider>
          </ThemeProvider>
        </LanguageProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
