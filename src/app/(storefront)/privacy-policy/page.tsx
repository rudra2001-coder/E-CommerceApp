'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const hardcoded = {
  title: 'Privacy Policy',
  lastUpdated: 'January 2026',
  content: `<section><h2>Introduction</h2><p>We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases.</p></section>
<section><h2>Information We Collect</h2><p><strong>Personal Information:</strong> When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping address, and payment information.</p><p><strong>Usage Data:</strong> We automatically collect information about how you interact with our website, including pages visited, time spent, and browsing patterns.</p></section>
<section><h2>How We Use Your Information</h2><ul><li>Process and fulfill your orders</li><li>Communicate with you about your orders and account</li><li>Send marketing communications (with your consent)</li><li>Improve our website and products</li><li>Detect and prevent fraud</li><li>Comply with legal obligations</li></ul></section>
<section><h2>Payment Information</h2><p>We use Razorpay to process payments securely. Your payment information is encrypted and transmitted directly to Razorpay. We do not store full credit card numbers or payment details on our servers.</p></section>
<section><h2>Cookies</h2><p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from.</p></section>
<section><h2>Contact</h2><p>If you have any questions, please contact us at <a href="mailto:privacy@store.com">privacy@store.com</a>.</p></section>`
}

export default function PrivacyPolicyPage() {
  const [cms, setCms] = useState<{ title?: string; content?: string }>({})

  useEffect(() => {
    fetch('/api/pages/privacy-policy')
      .then(res => res.ok ? res.json() : {})
      .then(data => setCms(data))
      .catch(() => {})
  }, [])

  const title = cms.title || hardcoded.title
  const content = cms.content || hardcoded.content

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-[#6B6B6B] mb-8">Last updated: January 2026</p>
        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6" dangerouslySetInnerHTML={{ __html: content }} />
      </motion.div>
    </div>
  )
}
