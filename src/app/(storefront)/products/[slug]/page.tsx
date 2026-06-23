'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Heart, Truck, Shield,
  RotateCcw, ChevronDown, Check, Star, Clock, FileText, Package
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, getSalePrice, getImageUrl, truncate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/storefront/StarRating'
import { QuantitySelector } from '@/components/storefront/QuantitySelector'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'
import type { Product, Review } from '@/types'

type AccordionKey = 'description' | 'specifications' | 'shipping' | 'reviews'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [imageZoom, setImageZoom] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.product) {
            setProduct(data.product)
            setCurrentImage(0)
          }
          if (data.related?.length > 0) setRelatedProducts(data.related)
          if (data.reviews?.length > 0) setReviews(data.reviews)
        }
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (!product) return
    supabase
      .from('reviews')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data as unknown as Review[])
      })
  }, [product?.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 pb-24 md:pb-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-[#F5F5F0] animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 rounded-xl bg-[#F5F5F0] animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-[#F5F5F0] animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-[#F5F5F0] animate-pulse rounded" />
            <div className="h-6 w-1/4 bg-[#F5F5F0] animate-pulse rounded" />
            <div className="h-20 bg-[#F5F5F0] animate-pulse rounded" />
            <div className="h-12 bg-[#F5F5F0] animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-sm text-[#6B6B6B] mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products"><Button variant="primary">Browse Products</Button></Link>
      </div>
    )
  }

  const salePrice = getSalePrice(product)
  const images = product.images?.length ? product.images.map(i => ({ ...i, image_url: getImageUrl(i.image_url) })) : [{ id: '0', product_id: product.id, image_url: '/placeholder.svg', sort_order: 0, alt_text: null }]
  const outOfStock = product.stock_quantity <= 0 && !product.allow_backorders
  const reviewStats = Array.from({ length: 5 }, (_, i) => {
    const count = reviews.filter(r => r.rating === i + 1).length
    return { stars: i + 1, count, percentage: reviews.length ? (count / reviews.length) * 100 : 0 }
  }).reverse()
  const badges = product.tags?.filter(t => ['New', 'Sale', 'Best Seller', 'Featured', 'Limited'].includes(t)) || []

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  const handleAddToCart = () => {
    if (outOfStock) return
    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      product_id: product.id,
      variant_id: null,
      title: product.title,
      price: salePrice || product.price,
      quantity,
      image: images[currentImage]?.image_url || '/placeholder.svg',
      variant_label: [selectedColor, selectedSize].filter(Boolean).join(' / '),
      sku: product.sku,
      max_quantity: product.stock_quantity,
    })
    toast('Added to cart!', 'success')
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast('Please sign in to review', 'warning')
      return
    }
    setSubmittingReview(true)
    try {
      await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.body,
      })
      toast('Review submitted!', 'success')
      setReviewForm({ rating: 5, title: '', body: '' })
    } catch {
      toast('Failed to submit review', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  const colors = ['Black', 'White', 'Navy', 'Gray', 'Beige']
  const sizes = ['XS', 'S', 'M', 'L', 'XL']

  const specs = [
    { label: 'Material', value: 'Premium Cotton Blend' },
    { label: 'Fit', value: 'Regular Fit' },
    { label: 'Care', value: 'Machine Wash Cold' },
    { label: 'Origin', value: 'Imported' },
    { label: 'SKU', value: product.sku },
  ]

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-8 pb-24 md:pb-8">
      <motion.nav initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-8">
        <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-[#1A1A1A] transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#1A1A1A] transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1A1A1A] truncate">{product.title}</span>
      </motion.nav>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F5F0] mb-4 group cursor-crosshair"
            onMouseEnter={() => setImageZoom(true)}
            onMouseLeave={() => setImageZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentImage]?.image_url || '/placeholder.svg'}
                  alt={images[currentImage]?.alt_text || product.title}
                  fill
                  priority
                  className={cn('object-cover transition-transform duration-200', imageZoom && 'scale-150')}
                  style={imageZoom ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
            {badges.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {badges.map(badge => (
                  <span key={badge} className={cn(
                    'px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full',
                    badge === 'Sale' && 'bg-[#DC2626] text-white',
                    badge === 'New' && 'bg-[#2563EB] text-white',
                    badge === 'Best Seller' && 'bg-[#F59E0B] text-white',
                    badge === 'Featured' && 'bg-[#16A34A] text-white',
                    badge === 'Limited' && 'bg-[#7C3AED] text-white',
                  )}>
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrentImage(i)}
                className={cn(
                  'relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                  i === currentImage ? 'border-[#2563EB]' : 'border-transparent hover:border-[rgba(0,0,0,0.15)]'
                )}
              >
                <Image
                  src={img.image_url || '/placeholder.svg'}
                  alt={img.alt_text || `${product.title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col">
          {product.category && (
            <p className="text-[10px] uppercase tracking-widest text-[#2563EB] font-semibold mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.review_avg || 0} size="sm" showValue />
            <span className="text-xs text-[#6B6B6B]">
              ({product.review_count || reviews.length} review{(product.review_count || reviews.length) !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            {salePrice ? (
              <>
                <span className="text-2xl font-bold">{formatCurrency(salePrice)}</span>
                <span className="text-lg text-[#6B6B6B] line-through">{formatCurrency(product.price)}</span>
                <span className="px-2 py-0.5 bg-[#DC2626]/10 text-[#DC2626] text-xs font-semibold rounded-full">
                  Save {formatCurrency(product.price - salePrice)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6">
            {truncate(product.description || 'No description available.', 200)}
          </p>

          <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B] mb-1">SKU: {product.sku}</p>

          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-3">
              Color: <span className="text-[#1A1A1A]">{selectedColor || 'Select'}</span>
            </h3>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 transition-all',
                    selectedColor === color ? 'border-[#2563EB] scale-110' : 'border-[rgba(0,0,0,0.12)] hover:border-[rgba(0,0,0,0.25)]'
                  )}
                  title={color}
                >
                  <span className="block w-full h-full rounded-full" style={{ backgroundColor: color.toLowerCase() }} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-3">
              Size: <span className="text-[#1A1A1A]">{selectedSize || 'Select'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'px-4 h-10 text-sm font-medium rounded-xl border transition-all',
                    selectedSize === size
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.12)] hover:border-[rgba(0,0,0,0.25)]'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <QuantitySelector value={quantity} min={1} max={product.stock_quantity || 99} onChange={setQuantity} />
            <div className="flex-1">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={outOfStock}
                onClick={handleAddToCart}
              >
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
            <button className="p-3 rounded-xl border border-[rgba(0,0,0,0.12)] hover:bg-[#F5F5F0] transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-[#F8F9FA] to-[#F0F1F3] rounded-2xl border border-[rgba(0,0,0,0.04)]">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'Orders over ৳2000' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '7-day return policy' },
              { icon: Shield, label: 'Secure', sub: 'SSL encrypted' },
              { icon: Clock, label: 'Quick Ship', sub: '1-3 business days' },
            ].slice(0, product.tags?.includes('Express') ? 4 : 3).map(item => (
              <div key={item.label} className="text-center">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-4 h-4 text-[#2563EB]" />
                </div>
                <p className="text-[11px] font-semibold text-[#1A1A1A]">{item.label}</p>
                <p className="text-[9px] text-[#6B6B6B] mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mt-16 border-t border-[rgba(0,0,0,0.06)] divide-y divide-[rgba(0,0,0,0.06)] bg-white rounded-2xl border-x border-b shadow-sm"
      >
        {[
          { key: 'description' as const, title: 'Description', icon: FileText, content: product.description || 'No description available.' },
          {
            key: 'specifications' as const, title: 'Specifications', icon: FileText,
            content: (
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(spec => (
                    <tr key={spec.label} className="border-b border-[rgba(0,0,0,0.04)]">
                      <td className="py-3 text-[#6B6B6B] w-1/3">{spec.label}</td>
                      <td className="py-3 font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          },
          {
            key: 'shipping' as const, title: 'Shipping and Returns', icon: Package,
            content: (
              <div className="text-sm text-[#6B6B6B] space-y-3">
                <p><strong className="text-[#1A1A1A]">Delivery:</strong> Free standard delivery across Bangladesh on orders over ৳2,000. Express delivery available for ৳150 within Dhaka city. Orders are processed within 1-2 business days.</p>
                <p><strong className="text-[#1A1A1A]">Returns:</strong> We accept returns within 7 days of delivery. Items must be unworn with tags attached. Refunds are processed within 3-5 business days after inspection.</p>
                <p><strong className="text-[#1A1A1A]">Cash on Delivery:</strong> Pay in cash when your order arrives. Also available: bKash, Nagad, Rocket payment on delivery.</p>
              </div>
            ),
          },
          {
            key: 'reviews' as const, title: `Reviews (${reviews.length})`, icon: FileText,
            content: (
              <div>
                <div className="flex gap-8 mb-8 p-6 bg-[#F5F5F0] rounded-2xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold font-serif">
                      {(product.review_avg || reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0).toFixed(1)}
                    </div>
                    <StarRating rating={product.review_avg || 0} size="sm" />
                    <p className="text-xs text-[#6B6B6B] mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {reviewStats.map(stat => (
                      <div key={stat.stars} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-[#6B6B6B]">{stat.stars} star</span>
                        <div className="flex-1 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${stat.percentage}%` }} />
                        </div>
                        <span className="w-6 text-right text-[#6B6B6B]">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {reviews.slice(0, reviewsPage * 5).map(review => (
                    <div key={review.id} className="p-4 border border-[rgba(0,0,0,0.06)] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-sm font-bold text-[#2563EB]">
                            {review.profile?.full_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.profile?.full_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-[10px] text-[#6B6B6B]">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {review.is_verified && (
                          <span className="flex items-center gap-1 text-[10px] text-[#16A34A] font-medium">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
                      {review.body && <p className="text-sm text-[#6B6B6B]">{review.body}</p>}
                    </div>
                  ))}
                  {reviews.length > reviewsPage * 5 && (
                    <button
                      onClick={() => setReviewsPage(p => p + 1)}
                      className="text-sm text-[#2563EB] hover:underline"
                    >
                      Load more reviews
                    </button>
                  )}
                  {reviews.length === 0 && (
                    <p className="text-sm text-[#6B6B6B] text-center py-8">No reviews yet. Be the first!</p>
                  )}
                </div>

                <div className="border-t border-[rgba(0,0,0,0.06)] pt-6">
                  <h4 className="font-medium mb-4">Write a Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-[#6B6B6B] block mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}>
                            <Star
                              className={cn(
                                'w-6 h-6 transition-colors',
                                star <= reviewForm.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E5E5E5]'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder="Review title (optional)"
                      value={reviewForm.title}
                      onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                    />
                    <textarea
                      placeholder="Write your review..."
                      value={reviewForm.body}
                      onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-3 text-sm border border-[rgba(0,0,0,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                    />
                    <Button type="submit" variant="primary" size="md" loading={submittingReview}>
                      Submit Review
                    </Button>
                  </form>
                </div>
              </div>
            ),
          },
        ].map(section => (
          <div key={section.key}>
            <button
              onClick={() => setOpenAccordion(openAccordion === section.key ? null : section.key)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-medium flex items-center gap-2">
                <section.icon className="w-4 h-4 text-[#6B6B6B]" />
                {section.title}
              </span>
              <ChevronDown className={cn(
                'w-4 h-4 text-[#6B6B6B] transition-transform duration-200',
                openAccordion === section.key && 'rotate-180'
              )} />
            </button>
            <AnimatePresence>
              {openAccordion === section.key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {relatedProducts.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16"
        >
          <h2 className="font-serif text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 md:-mx-16 px-6 md:px-16 scrollbar-none">
            {relatedProducts.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} className="shrink-0 w-48 md:w-56">
                <ProductCard product={p} priority={i < 2} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[rgba(0,0,0,0.08)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6B6B6B] truncate">{product.title}</p>
            <p className="text-sm font-bold">
              {salePrice ? (
                <>
                  {formatCurrency(salePrice)}
                  <span className="ml-1.5 text-xs text-[#6B6B6B] line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                formatCurrency(product.price)
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QuantitySelector value={quantity} min={1} max={product.stock_quantity || 99} onChange={setQuantity} />
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={cn(
                'px-5 h-10 text-sm font-semibold rounded-xl transition-all whitespace-nowrap',
                outOfStock
                  ? 'bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333] active:scale-[0.97]'
              )}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}