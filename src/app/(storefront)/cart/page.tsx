'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowRight, Percent } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuantitySelector } from '@/components/storefront/QuantitySelector'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const shipping = subtotal >= 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const discount = couponApplied ? subtotal * 0.1 : 0
  const total = subtotal + shipping + tax - discount

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'FLASH40') {
      setCouponApplied(true)
    }
  }

  if (items.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-[#6B6B6B]" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-sm text-[#6B6B6B] mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/products">
            <Button variant="primary" size="lg" shimmer>Continue Shopping</Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 md:py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Shopping Cart</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 md:gap-6 bg-white rounded-2xl p-4 md:p-6 border border-[rgba(0,0,0,0.04)]"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-[#F5F5F0] shrink-0">
                <Image
                  src={item.image || '/placeholder.svg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.product_id}`} className="font-medium text-sm md:text-base hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </Link>
                    {item.variant_label && (
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{item.variant_label}</p>
                    )}
                    <p className="text-xs text-[#6B6B6B] mt-0.5">SKU: {item.sku}</p>
                  </div>
                  <p className="font-semibold text-sm md:text-base shrink-0">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <QuantitySelector
                    value={item.quantity}
                    min={1}
                    max={item.max_quantity}
                    onChange={qty => updateQuantity(item.id, qty)}
                    size="sm"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#2563EB]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#6B6B6B] hover:text-[#DC2626] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:sticky lg:top-28 h-fit"
        >
          <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
            <h2 className="font-serif text-lg font-bold mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              {couponApplied ? (
                <div className="flex items-center gap-2 text-sm text-[#16A34A] bg-[#16A34A]/5 px-3 py-2 rounded-xl">
                  <Percent className="w-4 h-4" />
                  <span>FLASH40 applied — 10% off</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    className="h-10 text-sm flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="shrink-0">
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Shipping</span>
                <span>{shipping === 0 ? <span className="text-[#16A34A]">Free</span> : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <hr className="border-[rgba(0,0,0,0.06)]" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button variant="primary" size="lg" className="w-full" shimmer>
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/products" className="block mt-3 text-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
