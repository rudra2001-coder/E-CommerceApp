'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const statusColors: Record<string, string> = {
  pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  processing: 'bg-[#2563EB]/10 text-[#2563EB]',
  shipped: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  delivered: 'bg-[#16A34A]/10 text-[#16A34A]',
  cancelled: 'bg-[#DC2626]/10 text-[#DC2626]',
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setOrders(data as unknown as Order[])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  return (
    <div>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <h2 className="font-serif text-2xl font-bold">Order History</h2>
        <p className="text-sm text-[#6B6B6B]">View all your past orders and track current ones.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#F5F5F0] rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <motion.div key={order.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link
                href={`/account/orders/${order.id}`}
                className="block bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium">{order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                    <p className="text-xs text-[#6B6B6B]">{new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase rounded-full ${statusColors[order.fulfillment_status] || ''}`}>
                      {order.fulfillment_status}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase rounded-full ${
                      order.payment_status === 'paid' ? 'bg-[#16A34A]/10 text-[#16A34A]' :
                      order.payment_status === 'failed' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                      'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-[#6B6B6B]">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                    <span className="text-[#E5E5E5]">|</span>
                    <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6B6B6B]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#6B6B6B]" />
          </div>
          <h3 className="font-serif text-lg font-bold mb-2">No orders yet</h3>
          <p className="text-sm text-[#6B6B6B] mb-6">Start shopping to see your orders here.</p>
          <Link href="/products"><Button variant="primary">Browse Products</Button></Link>
        </motion.div>
      )}
    </div>
  )
}
