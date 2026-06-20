'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#FAFAFA] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="font-serif text-lg font-bold">
                  Cart ({items.length})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-[#F5F5F0] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#6B6B6B]" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Your cart is empty</h3>
                <p className="text-sm text-[#6B6B6B] mb-6">Looks like you haven&apos;t added anything yet.</p>
                <Link href="/products" onClick={closeCart}>
                  <Button variant="primary" size="lg">Continue Shopping</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 bg-white rounded-2xl p-4 border border-[rgba(0,0,0,0.04)]"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F5F5F0] shrink-0">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        {item.variant_label && (
                          <p className="text-xs text-[#6B6B6B] mt-0.5">{item.variant_label}</p>
                        )}
                        <p className="text-sm font-semibold mt-1">{formatCurrency(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[rgba(0,0,0,0.1)] rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-[#F5F5F0] rounded-l-lg transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-medium min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#F5F5F0] rounded-r-lg transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#6B6B6B] hover:text-[#DC2626] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-[rgba(0,0,0,0.06)] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B6B6B]">Subtotal</span>
                    <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">Shipping & taxes calculated at checkout</p>
                  <Link href="/checkout" onClick={closeCart}>
                    <Button variant="primary" size="lg" className="w-full">
                      Checkout — {formatCurrency(subtotal)}
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
