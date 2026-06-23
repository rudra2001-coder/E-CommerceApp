'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Globe, Clock } from 'lucide-react'

const hardcoded = {
  title: 'Shipping Policy',
  content: `<section><h2>Shipping Options</h2><p>We offer various shipping options to meet your needs. Standard shipping (5-7 business days) is free on orders over $50. Express shipping (2-3 business days) and Overnight shipping (next business day) are available at additional cost.</p></section>
<section><h2>Processing Time</h2><p>Orders are processed within 1-2 business days. You will receive a confirmation email once your order ships.</p></section>
<section><h2>International Shipping</h2><p>We ship to most countries worldwide. International delivery typically takes 7-14 business days. Customs fees and import duties may apply and are the responsibility of the customer.</p></section>
<section><h2>Tracking</h2><p>Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard.</p></section>`
}

const features = [
  { icon: Package, title: 'Careful Packaging', desc: 'Your items are securely packed' },
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: Clock, title: 'Fast Processing', desc: 'Orders ship within 1-2 days' },
  { icon: Globe, title: 'International', desc: 'Worldwide shipping available' },
]

export default function ShippingPolicyPage() {
  const [cms, setCms] = useState<{ title?: string; content?: string }>({})

  useEffect(() => {
    fetch('/api/pages/shipping-policy')
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
