'use client'

import { motion } from 'framer-motion'
import { Truck, Clock, Package, Globe } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Shipping Policy</h1>
        <p className="text-sm text-[#6B6B6B] mb-8">Last updated: January 2026</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over $50 within the US.' },
            { icon: Clock, title: 'Fast Processing', desc: 'Orders ship within 1-2 business days.' },
            { icon: Package, title: 'Careful Packaging', desc: 'Every order is packed with care.' },
            { icon: Globe, title: 'International', desc: 'Shipping to 50+ countries worldwide.' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-[#F5F5F0]">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-[#6B6B6B]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Shipping Methods & Rates</h2>
            <p>We offer the following shipping options for domestic US orders:</p>
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.1)]">
                  <th className="text-left py-2 font-medium">Method</th>
                  <th className="text-left py-2 font-medium">Delivery Time</th>
                  <th className="text-right py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <td className="py-2">Standard</td>
                  <td className="py-2">5-7 business days</td>
                  <td className="py-2 text-right">Free over $50 / $5.99</td>
                </tr>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <td className="py-2">Express</td>
                  <td className="py-2">2-3 business days</td>
                  <td className="py-2 text-right">$12.99</td>
                </tr>
                <tr>
                  <td className="py-2">Overnight</td>
                  <td className="py-2">1 business day</td>
                  <td className="py-2 text-right">$24.99</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Processing Time</h2>
            <p>Orders are processed within 1-2 business days after payment confirmation. Orders placed on weekends or holidays begin processing the next business day. Custom or personalized items may require additional processing time.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">International Shipping</h2>
            <p>We ship internationally to over 50 countries. International shipping rates are calculated at checkout based on destination, package weight, and selected method. Delivery times vary by location (typically 7-21 business days). Customs duties and taxes are the responsibility of the recipient.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Order Tracking</h2>
            <p>Once your order ships, you will receive a confirmation email with a tracking number. You can also track your order from your Account dashboard. Please allow 24-48 hours for tracking information to update.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Shipping Address</h2>
            <p>We are not responsible for orders shipped to incorrect addresses. Please verify your shipping address before completing checkout. If you notice an error after placing an order, contact us immediately to attempt a correction.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Lost or Damaged Items</h2>
            <p>If your package arrives damaged, please contact us within 48 hours with photos of the damage. For lost packages, we will initiate a trace with the carrier and work to resolve the issue as quickly as possible.</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
