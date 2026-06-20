'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, CreditCard, Truck, Package, ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateOrderNumber, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'

type Step = 'shipping' | 'payment' | 'review'

interface ShippingForm {
  full_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip: string
  country: string
}

const shippingMethods = [
  { id: 'standard', label: 'Standard Shipping', time: '5-7 business days', price: 0 },
  { id: 'express', label: 'Express Shipping', time: '2-3 business days', price: 12.99 },
  { id: 'overnight', label: 'Overnight Shipping', time: '1 business day', price: 24.99 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('shipping')
  const [processing, setProcessing] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [form, setForm] = useState<ShippingForm>({
    full_name: '',
    email: user?.email || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [errors, setErrors] = useState<Partial<ShippingForm>>({})

  const selectedMethod = shippingMethods.find(m => m.id === shippingMethod)!
  const shippingCost = selectedMethod.price
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'review', label: 'Review', icon: Package },
  ]

  const stepIndex = steps.findIndex(s => s.key === step)

  useEffect(() => {
    setForm(f => ({ ...f, email: user?.email || '' }))
  }, [user])

  const validateShipping = () => {
    const errs: Partial<ShippingForm> = {}
    if (!form.full_name.trim()) errs.full_name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.address_line1.trim()) errs.address_line1 = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.state.trim()) errs.state = 'Required'
    if (!form.zip.trim()) errs.zip = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 'shipping') {
      if (!validateShipping()) return
      setStep('payment')
    } else if (step === 'payment') {
      setStep('review')
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast('Please sign in to place an order', 'warning')
      return
    }
    setProcessing(true)
    try {
      const orderData = {
        user_id: user.id,
        email: form.email,
        shipping_address: form,
        billing_address: form,
        shipping_method: selectedMethod.label,
        shipping_cost: shippingCost,
        subtotal,
        discount_amount: 0,
        tax_amount: tax,
        total,
        payment_status: 'pending' as const,
        fulfillment_status: 'pending' as const,
        items: items.map(i => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          title: i.title,
          variant_info: i.variant_label ? { label: i.variant_label } : null,
          quantity: i.quantity,
          unit_price: i.price,
          line_total: i.price * i.quantity,
        })),
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error || !order) throw error || new Error('Failed to create order')

      // Razorpay integration
      const paymentRes = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId: order.id }),
      })
      const paymentData = await paymentRes.json()

      if (paymentData.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY,
          amount: paymentData.amount,
          currency: 'INR',
          name: 'STORE',
          description: `Order ${generateOrderNumber(order.id)}`,
          order_id: paymentData.razorpayOrderId,
          handler: async function (response: any) {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .eq('id', order.id)
            clearCart()
            router.push(`/order-confirmation/${order.id}`)
          },
          prefill: { name: form.full_name, email: form.email, contact: form.phone },
          theme: { color: '#2563EB' },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', async () => {
          await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
          toast('Payment failed. Please try again.', 'error')
        })
        rzp.open()
      } else {
        // Payment not configured - just create order
        clearCart()
        router.push(`/order-confirmation/${order.id}`)
      }
    } catch (err) {
      toast('Failed to place order', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const updateField = (field: keyof ShippingForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  if (items.length === 0 && step === 'shipping') {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-[#6B6B6B]" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Nothing to Checkout</h1>
          <p className="text-sm text-[#6B6B6B] mb-8">Add some items to your cart first.</p>
          <Link href="/products"><Button variant="primary">Continue Shopping</Button></Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 md:py-12">
      {/* Progress Steps */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
        <div className="flex items-center justify-center gap-2 md:gap-0">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={cn(
                'flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-colors',
                stepIndex >= i ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'text-[#6B6B6B]'
              )}>
                <s.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden md:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'w-8 md:w-16 h-0.5 mx-1 md:mx-2 transition-colors',
                  stepIndex > i ? 'bg-[#2563EB]' : 'bg-[#E5E5E5]'
                )} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
        {/* Form Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-serif text-xl font-bold mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Full Name" id="full_name" value={form.full_name} onChange={e => updateField('full_name', e.target.value)} error={errors.full_name} />
                    <Input label="Email" id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} error={errors.email} />
                  </div>
                  <Input label="Phone" id="phone" type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} error={errors.phone} />
                  <Input label="Address Line 1" id="address_line1" value={form.address_line1} onChange={e => updateField('address_line1', e.target.value)} error={errors.address_line1} />
                  <Input label="Address Line 2 (Optional)" id="address_line2" value={form.address_line2} onChange={e => updateField('address_line2', e.target.value)} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input label="City" id="city" value={form.city} onChange={e => updateField('city', e.target.value)} error={errors.city} />
                    <Input label="State" id="state" value={form.state} onChange={e => updateField('state', e.target.value)} error={errors.state} />
                    <Input label="ZIP Code" id="zip" value={form.zip} onChange={e => updateField('zip', e.target.value)} error={errors.zip} />
                  </div>
                  <Input label="Country" id="country" value={form.country} onChange={e => updateField('country', e.target.value)} />
                </div>

                <div className="mt-8">
                  <h3 className="font-medium mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    {shippingMethods.map(method => (
                      <label
                        key={method.id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                          shippingMethod === method.id ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)]'
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={e => setShippingMethod(e.target.value)}
                          className="text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-[#6B6B6B]">{method.time}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button variant="primary" size="lg" onClick={handleNext}>
                    Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-serif text-xl font-bold mb-2">Payment</h2>
                <p className="text-sm text-[#6B6B6B] mb-6">We use Razorpay for secure payments. You&apos;ll be redirected to complete payment after review.</p>

                <div className="p-6 bg-[#F5F5F0] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Credit / Debit Card</p>
                      <p className="text-xs text-[#6B6B6B]">Visa, Mastercard, RuPay, UPI, Net Banking</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" size="lg" onClick={() => setStep('shipping')}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleNext}>
                    Review Order <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="font-serif text-xl font-bold mb-6">Review Your Order</h2>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-[rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">Shipping Address</h3>
                      <button onClick={() => setStep('shipping')} className="text-xs text-[#2563EB] hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">{form.full_name}<br />{form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ''}<br />{form.city}, {form.state} {form.zip}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-[rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">Shipping Method</h3>
                      <button onClick={() => setStep('shipping')} className="text-xs text-[#2563EB] hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-[#6B6B6B]">{selectedMethod.label} — {selectedMethod.time}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Items ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-[#F5F5F0]">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                            <Image src={item.image || '/placeholder.svg'} alt={item.title} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            {item.variant_label && <p className="text-xs text-[#6B6B6B]">{item.variant_label}</p>}
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-[#6B6B6B]">Qty: {item.quantity}</span>
                              <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" size="lg" onClick={() => setStep('payment')}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={handlePlaceOrder} loading={processing} shimmer>
                    {processing ? 'Processing...' : `Place Order — ${formatCurrency(total)}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
            <h2 className="font-serif text-lg font-bold mb-6">Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <hr className="border-[rgba(0,0,0,0.06)]" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            {items.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-t border-[rgba(0,0,0,0.04)]">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F5F5F0] shrink-0">
                  <Image src={item.image || '/placeholder.svg'} alt={item.title} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{item.title}</p>
                  <p className="text-[10px] text-[#6B6B6B]">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-medium">{formatCurrency(item.price)}</span>
              </div>
            ))}
            {items.length > 3 && (
              <p className="text-xs text-[#6B6B6B] pt-2">+{items.length - 3} more item{(items.length - 3) !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShoppingBag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}


