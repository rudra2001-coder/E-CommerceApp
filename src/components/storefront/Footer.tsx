'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Check } from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SiteSettings } from '@/types'

const socialIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
}

export function Footer({ settings }: { settings?: SiteSettings | null }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const siteName = settings?.site_name || 'STORE'
  const logoUrl = settings?.logo_url

  const socialLinks = [
    { key: 'instagram', url: settings?.social_instagram, label: 'Instagram' },
    { key: 'facebook', url: settings?.social_facebook, label: 'Facebook' },
    { key: 'twitter', url: settings?.social_twitter, label: 'Twitter/X' },
    { key: 'youtube', url: settings?.social_youtube, label: 'YouTube' },
    { key: 'tiktok', url: settings?.social_tiktok, label: 'TikTok' },
  ].filter(s => s.url)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    } catch {}
    setSubmitted(true)
  }

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <Image src={getImageUrl(logoUrl)} alt={siteName} width={36} height={36} className="object-contain rounded-lg brightness-0 invert" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-[#1A1A1A] font-bold text-sm">{siteName[0]}</span>
                </div>
              )}
              <span className="font-serif text-2xl font-bold tracking-tight">{siteName}</span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed mb-6">
              Premium fashion for the modern individual. Curated collections, timeless designs.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(s => (
                <a key={s.key} href={s.url!} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={s.label}>
                  {socialIcons[s.key] || null}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/80">Shop</h4>
            <ul className="space-y-3">
              {[{ href: '/products', label: 'All Products' }, { href: '/products?sort=newest', label: 'New Arrivals' }, { href: '/products?sort=bestselling', label: 'Best Sellers' }, { href: '/products', label: 'Sale' }].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/80">Support</h4>
            <ul className="space-y-3">
              {[{ href: '/contact', label: 'Contact Us' }, { href: '/faq', label: 'FAQ' }, { href: '/shipping-policy', label: 'Shipping Policy' }, { href: '/returns-policy', label: 'Returns & Exchanges' }, { href: '/privacy-policy', label: 'Privacy Policy' }, { href: '/terms-of-service', label: 'Terms of Service' }].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/80">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Get 10% off your first order.</p>
            {submitted ? (
              <div className="flex items-center gap-2 text-[#16A34A]">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-10 px-3 text-sm bg-white/10 border border-white/20 rounded-xl placeholder:text-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button type="submit" variant="primary" size="sm" shimmer>Subscribe</Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-3 text-white/40">
            <span className="text-xs font-semibold text-white/60">bKash</span>
            <span className="text-xs font-semibold text-white/60">Nagad</span>
            <span className="text-xs font-semibold text-white/60">Rocket</span>
            <span className="text-xs font-semibold text-white/60">COD</span>
            <span className="text-xs font-semibold text-white/60">Visa</span>
            <span className="text-xs font-semibold text-white/60">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
