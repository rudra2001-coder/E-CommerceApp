'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartDrawer } from '@/components/storefront/CartDrawer'
import { SignInProvider } from '@/context/SignInContext'
import type { SiteSettings } from '@/types'

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [announcementDismissed, setAnnouncementDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  const showAnnouncement = settings?.announcement_bar_active && settings?.announcement_bar_text && !announcementDismissed

  return (
    <SignInProvider>
    <div className="flex flex-col min-h-screen">
      {showAnnouncement && (
        <div
          className="relative px-4 py-2.5 text-center text-sm font-medium"
          style={{ backgroundColor: settings.announcement_bar_color || '#2563EB', color: '#FFFFFF' }}
        >
          {settings.announcement_bar_link ? (
            <Link href={settings.announcement_bar_link} className="hover:underline">
              {settings.announcement_bar_text}
            </Link>
          ) : (
            <span>{settings.announcement_bar_text}</span>
          )}
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <Header settings={settings} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer settings={settings} />
      <CartDrawer />
    </div>
    </SignInProvider>
  )
}
