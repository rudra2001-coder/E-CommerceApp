'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    async function search() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=20&sort=newest`)
        if (res.ok) {
          const data = await res.json()
          if (data.products) setResults(data.products)
        }
      } catch {
        // no results
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [debouncedQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false })
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 md:py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-6">Search</h1>
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            autoFocus
            className="w-full h-14 pl-12 pr-12 bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {results.map((product, i) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} priority={i < 4} />
            </motion.div>
          ))}
        </motion.div>
      ) : debouncedQuery.trim() ? (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#6B6B6B]" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-2">No results for &ldquo;{debouncedQuery}&rdquo;</h3>
          <p className="text-sm text-[#6B6B6B]">Try different keywords or browse our categories.</p>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-16">
          <p className="text-sm text-[#6B6B6B]">Type something to start searching.</p>
        </motion.div>
      )}
    </div>
  )
}
