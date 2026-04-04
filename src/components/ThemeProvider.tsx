'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const theme = session?.user?.siteTheme ?? 'default'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.cookie = `foodlist-theme=${theme};path=/;max-age=31536000`
  }, [theme])

  return <>{children}</>
}
