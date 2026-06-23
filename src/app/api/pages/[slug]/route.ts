import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = supabaseAdmin()

    const { data, error } = await supabase
      .from('pages')
      .select('title, content, meta_title, meta_description, image_url')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
