let razorpayInstance: any = null

export function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay')
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY || 'placeholder',
      key_secret: process.env.RAZORPAY_SECRET_KEY || 'placeholder',
    })
  }
  return razorpayInstance
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export async function createPaymentIntent(amount: number, currency: string, receipt: string): Promise<RazorpayOrder> {
  const razorpay = getRazorpay()
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: currency || 'INR',
    receipt,
    payment_capture: true,
  })
  return order
}
