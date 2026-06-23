import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = supabaseAdmin()

    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
      .eq('slug', slug)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: related } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('status', 'active')
      .limit(8)

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({ product, related: related || [], reviews: reviews || [] }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
