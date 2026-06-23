'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { FaqItem } from '@/types'

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [cmsContent, setCmsContent] = useState<{ title?: string; content?: string }>({})
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.ok ? res.json() : [])
      .then(data => setFaqItems(data))
      .catch(() => {})
    fetch('/api/pages/faq')
      .then(res => res.ok ? res.json() : {})
      .then(data => setCmsContent(data))
      .catch(() => {})
  }, [])

  const filtered = faqItems.filter(
    item => item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, FaqItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div>
      <section className="py-16 md:py-24 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-[1440px] px-6 md:px-16"
        >
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              {cmsContent.title || 'Frequently Asked Questions'}
            </h1>
            {cmsContent.content && (
              <div className="text-sm text-[#6B6B6B] mb-8 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cmsContent.content }} />
            )}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-[#F5F5F0] rounded-xl border-none outline-none text-sm focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
                <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[rgba(0,0,0,0.06)]">
                  <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">{category}</h2>
                </div>
                <div className="divide-y divide-[rgba(0,0,0,0.04)]">
                  {items.map(item => (
                    <div key={item.id}>
                      <button
                        onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F8F9FA] transition-colors"
                      >
                        <span className="text-sm font-medium text-[#1A1A1A] pr-4">{item.question}</span>
                        <ChevronDown className={cn('w-4 h-4 text-[#6B6B6B] shrink-0 transition-transform', openId === item.id && 'rotate-180')} />
                      </button>
                      {openId === item.id && (
                        <div className="px-6 pb-4">
                          <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#6B6B6B]">No matching questions found.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-2xl">
              <MessageCircle className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm text-[#6B6B6B]">Still need help?</span>
              <Link href="/contact">
                <Button variant="primary" size="sm">Contact Us</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
