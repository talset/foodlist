import type { Metadata, Viewport } from 'next'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Foodlist',
  description: 'Gestion du stock alimentaire et des courses',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Foodlist',
  },
  icons: {
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <SessionProviderWrapper>
          {children}
          <BottomNav />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
