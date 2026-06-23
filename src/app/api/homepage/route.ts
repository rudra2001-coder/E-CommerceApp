import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = supabaseAdmin()
    const now = new Date().toISOString()

    const [
      settingsRes,
      heroSlidesRes,
      sectionsRes,
      testimonialsRes,
      featuresRes,
      bannersRes,
      categoriesRes,
      newArrivalsRes,
      bestSellersRes,
    ] = await Promise.all([
      supabase.from('site_settings').select('*').single(),
      supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true }),
      supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('features').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('banners').select('*').eq('is_active', true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_to.is.null,valid_to.gte.${now}`)
        .order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
      supabase.from('products').select('*, category:categories(*), images:product_images(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*, category:categories(*), images:product_images(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(8),
    ])

    const headers = { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' }

    return NextResponse.json({
      settings: settingsRes.data || null,
      heroSlides: heroSlidesRes.data || [],
      sections: sectionsRes.data || [],
      testimonials: testimonialsRes.data || [],
      features: featuresRes.data || [],
      banners: bannersRes.data || [],
      categories: categoriesRes.data || [],
      newArrivals: newArrivalsRes.data || [],
      bestSellers: bestSellersRes.data || [],
    }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
