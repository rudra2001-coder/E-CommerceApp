import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = supabaseAdmin()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), timeline:order_timeline(*)')
      .eq('id', id)
      .single()

    if (error || !order) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      console.error('Order fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = supabaseAdmin()

    const allowedFields = [
      'payment_status',
      'fulfillment_status',
      'shipping_method',
      'shipping_cost',
      'tracking_number',
      'tracking_carrier',
      'notes',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    if (body.fulfillment_status) {
      const { data: user } = await supabase.auth.getUser()
      await supabase.from('order_timeline').insert({
        order_id: id,
        status: body.fulfillment_status,
        note: body.timeline_note || null,
        created_by: user?.user?.id || null,
      })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, items:order_items(*), timeline:order_timeline(*)')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      console.error('Order update error:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
