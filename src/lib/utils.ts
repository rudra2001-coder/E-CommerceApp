import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencySymbol = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).trimEnd() + '...'
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http')) return path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}

export function generateOrderNumber(id: string): string {
  const num = id.replace(/-/g, '').substring(0, 8).toUpperCase()
  return `ORD-${num}`
}

export function getSalePrice(product: { price: number; sale_price: number | null; sale_start: string | null; sale_end: string | null }): number | null {
  if (!product.sale_price) return null
  const now = new Date()
  if (product.sale_start && new Date(product.sale_start) > now) return null
  if (product.sale_end && new Date(product.sale_end) < now) return null
  return product.sale_price
}
