'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, MapPin, CreditCard, Check, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateOrderNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Order, OrderTimeline } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const timelineIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Package,
  delivered: Check,
  cancelled: Clock,
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<OrderTimeline[]>([])
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

        const { data: tl } = await supabase
          .from('order_timeline')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: true })
        if (tl) setTimeline(tl)
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-32 bg-[#F5F5F0] rounded" />
        <div className="h-8 w-64 bg-[#F5F5F0] rounded" />
        <div className="h-40 bg-[#F5F5F0] rounded-2xl" />
        <div className="h-40 bg-[#F5F5F0] rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-xl font-bold mb-2">Order Not Found</h2>
        <p className="text-sm text-[#6B6B6B] mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/account/orders"><Button variant="outline">Back to Orders</Button></Link>
      </div>
    )
  }

  const defaultTimeline: OrderTimeline[] = [
    { id: '1', order_id: order.id, status: 'pending', note: 'Order placed', created_by: null, created_at: order.created_at },
  ]

  const displayTimeline = timeline.length > 0 ? timeline : defaultTimeline

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <h2 className="font-serif text-2xl font-bold">{generateOrderNumber(order.id)}</h2>
        <p className="text-sm text-[#6B6B6B]">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </motion.div>

      {/* Timeline */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
        <h3 className="font-medium mb-4">Order Timeline</h3>
        <div className="relative pl-8 space-y-6">
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-[#E5E5E5]" />
          {displayTimeline.map((entry, i) => {
            const Icon = timelineIcons[entry.status] || Clock
            const isLast = i === displayTimeline.length - 1
            return (
              <div key={entry.id} className="relative">
                <div className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center ${isLast ? 'bg-[#2563EB] text-white' : 'bg-[#F5F5F0] text-[#6B6B6B]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{entry.status}</p>
                  {entry.note && <p className="text-xs text-[#6B6B6B]">{entry.note}</p>}
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Items */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
        <h3 className="font-medium mb-4">Items ({order.items?.length || 0})</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                {item.variant_info && <p className="text-xs text-[#6B6B6B]">{Object.values(item.variant_info).join(' / ')}</p>}
                <p className="text-xs text-[#6B6B6B]">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(item.line_total)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)] space-y-2 text-sm">
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Shipping</span>
            <span>{order.shipping_cost === 0 ? 'Free' : formatCurrency(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Tax</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-[#16A34A]">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-[rgba(0,0,0,0.06)]">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </motion.div>

      {/* Shipping */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#6B6B6B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Shipping Address</h3>
            <p className="text-sm text-[#6B6B6B]">
              {(order.shipping_address as any)?.full_name}<br />
              {(order.shipping_address as any)?.address_line1}<br />
              {(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.state} {(order.shipping_address as any)?.zip}
            </p>
          </div>
        </div>
        {order.shipping_method && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[rgba(0,0,0,0.04)]">
            <Package className="w-4 h-4 text-[#6B6B6B]" />
            <p className="text-sm text-[#6B6B6B]">{order.shipping_method}</p>
          </div>
        )}
      </motion.div>

      {/* Payment */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-[#6B6B6B]" />
          <div>
            <h3 className="font-medium mb-0.5">Payment</h3>
            <p className="text-sm text-[#6B6B6B]">
              {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'failed' ? 'Failed' : 'Pending'}
              {order.razorpay_payment_id && ` — ID: ${order.razorpay_payment_id}`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
