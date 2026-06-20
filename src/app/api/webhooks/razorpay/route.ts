import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return expected === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

    if (!verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = supabaseAdmin()

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload.payment.entity.id

        await supabase
          .from('orders')
          .update({ payment_status: 'paid', razorpay_payment_id: paymentId })
          .eq('razorpay_payment_id', paymentId)

        break
      }

      case 'payment.failed': {
        const paymentId = event.payload.payment.entity.id

        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('razorpay_payment_id', paymentId)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
