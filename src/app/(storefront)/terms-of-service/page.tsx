'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[#6B6B6B] mb-8">Last updated: January 2026</p>

        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Acceptance of Terms</h2>
            <p>By accessing and using the STORE website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Account Registration</h2>
            <p>When creating an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Product Information</h2>
            <p>We strive to display accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content are error-free. If a product is listed at an incorrect price, we reserve the right to cancel orders placed at that price.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Orders & Payment</h2>
            <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, errors in pricing, or suspected fraud. Payment must be received before order processing begins.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Pricing & Taxes</h2>
            <p>All prices are listed in USD unless otherwise stated. Prices do not include applicable taxes, which will be added at checkout based on your shipping address. We reserve the right to modify prices at any time without prior notice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Intellectual Property</h2>
            <p>All content on this website, including text, images, logos, and designs, is the property of STORE and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Limitation of Liability</h2>
            <p>STORE shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid by you for the product giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Contact</h2>
            <p>For questions about these Terms of Service, please contact us at <a href="mailto:legal@store.com" className="text-[#2563EB]">legal@store.com</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
