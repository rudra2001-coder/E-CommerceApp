import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
