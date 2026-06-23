'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const hardcoded = {
  title: 'Terms of Service',
  content: `<section><h2>Acceptance of Terms</h2><p>By accessing and using this website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p></section>
<section><h2>Account Registration</h2><p>You are responsible for maintaining the confidentiality of your account information and for all activities under your account. You must provide accurate and complete information.</p></section>
<section><h2>Orders & Payment</h2><p>All orders are subject to acceptance and availability. We reserve the right to cancel any order. Prices are subject to change without notice. Payment is due at the time of purchase.</p></section>
<section><h2>Intellectual Property</h2><p>All content on this website, including images, text, and designs, is our property and is protected by copyright laws.</p></section>
<section><h2>Contact</h2><p>For questions about these terms, contact us at <a href="mailto:legal@store.com">legal@store.com</a>.</p></section>`
}

export default function TermsPage() {
  const [cms, setCms] = useState<{ title?: string; content?: string }>({})

  useEffect(() => {
    fetch('/api/pages/terms-of-service')
      .then(res => res.ok ? res.json() : {})
      .then(data => setCms(data))
      .catch(() => {})
  }, [])

  const title = cms.title || hardcoded.title
  const content = cms.content || hardcoded.content

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-6">{title}</h1>
        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6" dangerouslySetInnerHTML={{ __html: content }} />
      </motion.div>
    </div>
  )
}
