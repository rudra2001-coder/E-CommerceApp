'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'
import { formatCurrency, getSalePrice, cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const salePrice = getSalePrice(product)
  const mainImage = product.images?.[0]?.image_url || '/placeholder.svg'
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock_quantity <= 0) return
    addItem({
      id: product.id,
      product_id: product.id,
      variant_id: null,
      title: product.title,
      price: salePrice || product.price,
      quantity: 1,
      image: mainImage,
      variant_label: '',
      sku: product.sku,
      max_quantity: product.stock_quantity,
    })
    toast('Added to cart', 'success')
  }

  return (
    <motion.div
      layout
      className="group relative bg-white rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-[rgba(0,0,0,0.04)] transition-shadow duration-300"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F0]">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-1 bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-wider rounded-full"
              >
                New
              </motion.span>
            )}
            {salePrice && (
              <span className="px-2.5 py-1 bg-[#DC2626] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                Sale
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B] mb-1">
            {product.category?.name || 'Accessories'}
          </p>
          <h3 className="font-medium text-sm truncate">{product.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            {salePrice ? (
              <>
                <span className="font-semibold text-sm">{formatCurrency(salePrice)}</span>
                <span className="text-xs text-[#6B6B6B] line-through">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="font-semibold text-sm">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
