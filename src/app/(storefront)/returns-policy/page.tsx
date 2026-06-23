'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, RefreshCw, Undo2, Smile } from 'lucide-react'

const hardcoded = {
  title: 'Returns & Exchanges',
  content: `<section><h2>Return Policy</h2><p>We offer a 30-day hassle-free return policy from the date of delivery. Items must be unworn, unwashed, and with all tags attached. Returns that do not meet these criteria may be rejected.</p></section>
<section><h2>How to Start a Return</h2><p>Log into your account, go to Orders, select the item you want to return, and follow the instructions. You will receive a return authorization and shipping label via email.</p></section>
<section><h2>Refunds</h2><p>Refunds are processed within 5-7 business days after we receive your return. The refund will be issued to your original payment method. Shipping costs are non-refundable.</p></section>
<section><h2>Exchanges</h2><p>We offer exchanges for a different size or color subject to availability. Please initiate a return and place a new order for the desired item.</p></section>
<section><h2>Damaged or Incorrect Items</h2><p>If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photos and your order number. We will arrange a replacement or full refund.</p></section>`
}

const features = [
  { icon: RotateCcw, title: '30-Day Returns', desc: 'From delivery date' },
  { icon: RefreshCw, title: 'Hassle-Free', desc: 'Easy return process' },
  { icon: Undo2, title: 'Quick Refunds', desc: 'Processed within 5-7 days' },
  { icon: Smile, title: 'Satisfaction', desc: 'Your happiness matters' },
]

export default function ReturnsPolicyPage() {
  const [cms, setCms] = useState<{ title?: string; content?: string }>({})

  useEffect(() => {
    fetch('/api/pages/returns-policy')
      .then(res => res.ok ? res.json() : {})
      .then(data => setCms(data))
      .catch(() => {})
  }, [])

  const title = cms.title || hardcoded.title
  const content = cms.content || hardcoded.content

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">{title}</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="text-center p-4 bg-[#F8F9FA] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/5 flex items-center justify-center mx-auto mb-2">
                <f.icon className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6" dangerouslySetInnerHTML={{ __html: content }} />
      </motion.div>
    </div>
  )
}
