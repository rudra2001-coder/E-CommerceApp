'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Package, Truck, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateOrderNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', id)
          .single()
        if (data) setOrder(data as unknown as Order)
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 md:py-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-xl mx-auto text-center">
        {/* Animated Checkmark */}
        <div className="w-24 h-24 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </motion.svg>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-[#6B6B6B] mb-2">Thank you for your purchase.</p>

        {loading ? (
          <div className="animate-pulse space-y-3 py-8">
            <div className="h-4 w-1/2 bg-[#F5F5F0] rounded mx-auto" />
            <div className="h-8 w-1/3 bg-[#F5F5F0] rounded mx-auto" />
          </div>
        ) : order ? (
          <>
            <div className="inline-block bg-[#2563EB]/5 rounded-2xl px-6 py-3 mb-8">
              <p className="text-xs text-[#6B6B6B]">Order Number</p>
              <p className="text-lg font-bold text-[#2563EB]">{generateOrderNumber(order.id)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] mb-8 text-left">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-[#6B6B6B]">{item.title} × {item.quantity}</span>
                    <span>{formatCurrency(item.line_total)}</span>
                  </div>
                ))}
                <hr className="border-[rgba(0,0,0,0.06)]" />
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Shipping</span>
                  <span>{order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Tax</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <hr className="border-[rgba(0,0,0,0.06)]" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B] mb-8">
              <Clock className="w-4 h-4" />
              <span>Estimated delivery: 5-7 business days</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/products">
                <Button variant="primary" size="lg" shimmer>
                  Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/account/orders">
                <Button variant="outline" size="lg">
                  <Package className="w-4 h-4 mr-2" /> Track Order
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="py-8">
            <p className="text-[#6B6B6B] mb-6">We couldn&apos;t find this order.</p>
            <Link href="/"><Button variant="primary">Go Home</Button></Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
