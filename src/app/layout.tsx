import type { Metadata, Viewport } from 'next'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import BottomNav from '@/components/BottomNav'
import ThemeProvider from '@/components/ThemeProvider'
import { generateThemeCSS } from '@/lib/themes'
import './globals.css'

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
  themeColor: '#60a5fa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: generateThemeCSS() }} />
      </head>
      <body style={{ margin: 0, paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=document.cookie.match(/foodlist-theme=([^;]+)/);if(t)document.documentElement.dataset.theme=t[1]})()` }} />
        <SessionProviderWrapper>
          <ThemeProvider>
            {children}
            <BottomNav />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
