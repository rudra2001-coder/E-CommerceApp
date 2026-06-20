'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function WishlistPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    async function fetchWishlist() {
      try {
        const { data: wishlist } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId)

        if (wishlist && wishlist.length > 0) {
          const ids = wishlist.map(w => w.product_id)
          const { data } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .in('id', ids)
            .eq('status', 'active')
          if (data) setProducts(data as unknown as Product[])
        }
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [user])

  return (
    <div>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <h2 className="font-serif text-2xl font-bold">My Wishlist</h2>
        <p className="text-sm text-[#6B6B6B]">Products you&apos;ve saved for later.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {products.map(product => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-16 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#6B6B6B]" />
          </div>
          <h3 className="font-serif text-lg font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-[#6B6B6B] mb-6">Save your favorite products by tapping the heart icon.</p>
          <Link href="/products">
            <Button variant="primary">
              <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
