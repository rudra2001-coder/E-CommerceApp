'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#6B6B6B] mb-8">Last updated: January 2026</p>

        <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Introduction</h2>
            <p>STORE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Information We Collect</h2>
            <p><strong>Personal Information:</strong> When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping address, and payment information.</p>
            <p><strong>Usage Data:</strong> We automatically collect information about how you interact with our website, including pages visited, time spent, and browsing patterns.</p>
            <p><strong>Device Information:</strong> We collect information about the device you use to access our site, including browser type, IP address, and operating system.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and products</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Payment Information</h2>
            <p>We use Razorpay to process payments securely. Your payment information is encrypted and transmitted directly to Razorpay. We do not store full credit card numbers or payment details on our servers.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Cookies</h2>
            <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Data Sharing</h2>
            <p>We do not sell your personal information to third parties. We may share your information with trusted service providers who assist in operating our website and conducting our business, subject to confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">Contact</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@store.com" className="text-[#2563EB]">privacy@store.com</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
