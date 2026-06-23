import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const categories = searchParams.get('categories')
    const ids = searchParams.get('ids')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    const supabase = supabaseAdmin()
    let query = supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)', { count: 'exact' })
      .eq('status', 'active')

    if (ids) {
      const idList = ids.split(',').filter(Boolean)
      if (idList.length > 0) query = query.in('id', idList)
    }

    if (categories) {
      const catList = categories.split(',').filter(Boolean)
      if (catList.length > 0) query = query.in('category_id', catList)
    } else if (category) {
      query = query.eq('category_id', category)
    }

    const categorySlug = searchParams.get('category_slug')
    if (categorySlug) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('title', { ascending: true })
        break
      case 'name_desc':
        query = query.order('title', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: products, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const headers = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    }, { headers })
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
