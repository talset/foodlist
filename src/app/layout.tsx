import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foodlist',
  description: 'Gestion du stock alimentaire et des courses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
