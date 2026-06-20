import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getClient()

export const supabaseAdmin = () => {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getClient()
  }
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
