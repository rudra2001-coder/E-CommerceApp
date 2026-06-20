'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User, ShoppingBag, MapPin, Heart, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Settings', icon: Settings },
]

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
          <User className="w-5 h-5 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold">My Account</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-1 sticky top-28">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all',
                  pathname === item.href
                    ? 'bg-[#2563EB]/5 text-[#2563EB] font-medium'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F5F0]'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-[rgba(0,0,0,0.06)]" />
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#6B6B6B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </aside>
        <main className="md:col-span-3 min-h-[50vh]">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
