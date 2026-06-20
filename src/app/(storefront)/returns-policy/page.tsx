'use client'

import { motion } from 'framer-motion'
import { RotateCcw, Check, Clock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Returns & Exchanges</h1>
        <p className="text-sm text-[#6B6B6B] mb-8">Last updated: January 2026</p>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: RotateCcw, title: '30-Day Returns', desc: 'From delivery date' },
            { icon: Check, title: 'Hassle-Free', desc: 'Easy return process' },
            { icon: Clock, title: 'Quick Refunds', desc: '5-7 business days' },
          ].map(item => (
            <div key={item.title} className="text-center p-6 rounded-xl bg-[#F5F5F0]">
              <item.icon className="w-6 h-6 mx-auto mb-3 text-[#2563EB]" />
              <h3 className="font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-[#6B6B6B]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Return Policy</h2>
            <p>We want you to love your purchase. If something isn&apos;t right, you have <strong>30 days from delivery</strong> to initiate a return or exchange.</p>
            <p>To be eligible for a return:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Items must be unworn, unwashed, and unused</li>
              <li>All original tags must be attached</li>
              <li>Items must be returned in original packaging</li>
              <li>Sale items marked as "Final Sale" cannot be returned</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">How to Start a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log into your account and go to your Orders</li>
              <li>Find the item you wish to return and click "Return"</li>
              <li>Select the reason for return and submit</li>
              <li>Print the prepaid return label</li>
              <li>Package the item securely and drop off at the carrier location</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Refunds</h2>
            <p>Once we receive your return, we will inspect the item within 2-3 business days. Refunds are processed to the original payment method within 5-7 business days. You will receive an email notification once your refund has been issued.</p>
            <p>Shipping costs are non-refundable. Return shipping is free for exchanges.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Exchanges</h2>
            <p>For size or color exchanges, please initiate a return and place a new order for the desired item. This ensures the fastest processing and availability. We do not hold inventory for exchanges.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Damaged or Incorrect Items</h2>
            <p>If you received a damaged or incorrect item, please contact us within 48 hours of delivery at <a href="mailto:support@store.com" className="text-[#2563EB]">support@store.com</a> with your order number and photos. We will resolve the issue promptly at no additional cost to you.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/contact"><Button variant="primary" size="md">Contact Support</Button></Link>
        </div>
      </motion.div>
    </div>
  )
}
