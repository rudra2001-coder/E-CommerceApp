'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Check, Star, ShoppingBag, Truck, Shield, RotateCcw, Clock, Award, Headphones, Zap, Heart, Gift } from 'lucide-react'
import { cn, formatCurrency, getImageUrl, truncate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/storefront/StarRating'
import type { Product, Category, HeroSlide, Testimonial, Feature, Banner, SiteSettings, HomepageSection } from '@/types'

const iconMap: Record<string, any> = { Truck, Shield, RotateCcw, Clock, Award, Headphones, Zap, Heart, Gift }

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const heroAnimations: Record<string, { initial: any; animate: any; exit: any }> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  zoom: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [fallbackTestimonials] = useState([
    { id: '1', name: 'Sarah M.', role: 'Verified Buyer', text: 'The quality exceeded my expectations. Fast shipping too!', rating: 5, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
    { id: '2', name: 'James K.', role: 'Verified Buyer', text: 'Beautiful pieces at reasonable prices. Will definitely order again.', rating: 5, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
    { id: '3', name: 'Emily R.', role: 'Verified Buyer', text: 'Customer service was incredibly helpful with my exchange.', rating: 4, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
    { id: '4', name: 'Michael P.', role: 'Verified Buyer', text: 'My go-to store for minimalist fashion. Always consistent.', rating: 5, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
    { id: '5', name: 'Aisha T.', role: 'Verified Buyer', text: 'The fabric quality is unmatched. Love this brand!', rating: 5, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
    { id: '6', name: 'David L.', role: 'Verified Buyer', text: 'Easy returns and great communication. Highly recommend.', rating: 4, avatar_url: null, is_active: true, sort_order: 0, created_at: '', updated_at: '' },
  ])
  const [fallbackFeatures] = useState([
    { id: '1', title: 'Free Shipping', description: 'On orders over $50', icon_name: 'Truck', is_active: true, sort_order: 0, created_at: '' },
    { id: '2', title: 'Secure Checkout', description: '256-bit SSL encrypted', icon_name: 'Shield', is_active: true, sort_order: 0, created_at: '' },
    { id: '3', title: 'Easy Returns', description: '30-day return policy', icon_name: 'RotateCcw', is_active: true, sort_order: 0, created_at: '' },
    { id: '4', title: '24/7 Support', description: 'Dedicated customer care', icon_name: 'Clock', is_active: true, sort_order: 0, created_at: '' },
  ])
  const [fallbackHeroSlides] = useState([
    { id: '1', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80', heading: 'Summer Collection 2026', subheading: 'Light fabrics, bold designs — redefine your wardrobe.', cta_text: 'Explore Now', cta_link: '/products?category=summer', sort_order: 0, is_active: true, animation_type: 'fade' as const, text_color: '#FFFFFF', overlay_opacity: 0.4 },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80', heading: 'Minimalist Essentials', subheading: 'Clean lines, timeless appeal.', cta_text: 'Shop Minimal', cta_link: '/products?category=minimal', sort_order: 0, is_active: true, animation_type: 'fade' as const, text_color: '#FFFFFF', overlay_opacity: 0.4 },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80', heading: 'Luxury Redefined', subheading: 'Handpicked premium pieces for the discerning.', cta_text: 'Discover Luxury', cta_link: '/products?category=luxury', sort_order: 0, is_active: true, animation_type: 'fade' as const, text_color: '#FFFFFF', overlay_opacity: 0.4 },
    { id: '4', image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80', heading: 'New Drops Weekly', subheading: 'Be the first to wear tomorrow.', cta_text: 'View New Arrivals', cta_link: '/products?sort=newest', sort_order: 0, is_active: true, animation_type: 'fade' as const, text_color: '#FFFFFF', overlay_opacity: 0.4 },
  ])

  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    const update = () => {
      const diff = end.getTime() - Date.now()
      if (diff <= 0) return
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    intervalRef.current = setInterval(update, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const res = await fetch('/api/homepage')
        if (res.ok) {
          const data = await res.json()
          if (data.heroSlides?.length > 0) setHeroSlides(data.heroSlides)
          if (data.sections) setSections(data.sections)
          if (data.testimonials?.length > 0) setTestimonials(data.testimonials)
          if (data.features?.length > 0) setFeatures(data.features)
          if (data.banners?.length > 0) setBanners(data.banners)
          if (data.settings) setSettings(data.settings)
          if (data.categories?.length > 0) setCategories(data.categories)
          if (data.newArrivals?.length > 0) setNewArrivals(data.newArrivals)
          if (data.bestSellers?.length > 0) setBestSellers(data.bestSellers)
          setLoading(false)
        }
      } catch {
        // use fallbacks
      } finally {
        setLoading(false)
      }
    }
    fetchHomepageData()
  }, [])

  useEffect(() => {
    const slides = heroSlides.length > 0 ? heroSlides : fallbackHeroSlides
    if (slides.length <= 1) return
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(slideInterval)
  }, [heroSlides.length, fallbackHeroSlides.length])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      setNewsletterSubmitted(true)
    } catch {
      setNewsletterSubmitted(true)
    }
  }

  const getSection = (key: string) => sections.find(s => s.section_key === key)
  const isSectionVisible = (key: string) => {
    const section = getSection(key)
    return section ? section.is_visible : true
  }

  const activeSlides = heroSlides.length > 0 ? heroSlides : fallbackHeroSlides
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials
  const displayFeatures = features.length > 0 ? features : fallbackFeatures
  const activeBanners = banners.filter(b => b.is_active)

  const placeholderCategories: Category[] = [
    { id: '1', name: 'Clothing', slug: 'clothing', description: null, image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80', parent_id: null, sort_order: 1, created_at: '' },
    { id: '2', name: 'Accessories', slug: 'accessories', description: null, image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80', parent_id: null, sort_order: 2, created_at: '' },
    { id: '3', name: 'Footwear', slug: 'footwear', description: null, image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', parent_id: null, sort_order: 3, created_at: '' },
    { id: '4', name: 'Bags', slug: 'bags', description: null, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', parent_id: null, sort_order: 4, created_at: '' },
  ]

  const displayCategories = categories.length > 0 ? categories : placeholderCategories

  return (
    <div>
      {/* Hero Section */}
      {isSectionVisible('hero') && (
        <section className="relative h-[70vh] min-h-[500px] md:h-[85vh] overflow-hidden bg-[#1A1A1A]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              {...(heroAnimations[activeSlides[currentSlide]?.animation_type || 'fade'] || heroAnimations.fade)}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={getImageUrl(activeSlides[currentSlide]?.image_url) || activeSlides[currentSlide]?.image_url || ''}
                alt={activeSlides[currentSlide]?.heading || ''}
                fill
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"
                style={{ opacity: activeSlides[currentSlide]?.overlay_opacity ?? 0.4 }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 h-full flex items-center">
            <div className="mx-auto max-w-[1440px] px-6 md:px-16 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentSlide}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl"
                  style={{ color: activeSlides[currentSlide]?.text_color || '#FFFFFF' }}
                >
                  <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4" style={{ color: activeSlides[currentSlide]?.text_color || '#FFFFFF' }}>
                    {activeSlides[currentSlide]?.heading?.split(' ').map((word: string, i: number, arr: string[]) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        className="inline-block mr-[0.25em]"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h1>
                  {activeSlides[currentSlide]?.subheading && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="text-lg md:text-xl mb-8 max-w-lg"
                      style={{ color: activeSlides[currentSlide]?.text_color ? `${activeSlides[currentSlide].text_color}BF` : undefined }}
                    >
                      {activeSlides[currentSlide]?.subheading}
                    </motion.p>
                  )}
                  {activeSlides[currentSlide]?.cta_text && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      <Link href={activeSlides[currentSlide]?.cta_link || '#'}>
                        <Button variant="primary" size="lg" shimmer>
                          {activeSlides[currentSlide]?.cta_text}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {activeSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    'h-1 rounded-full transition-all duration-500',
                    i === currentSlide ? 'w-12 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Categories */}
      {isSectionVisible('categories') && (
        <section className="py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">{getSection('categories')?.title || 'Shop by Category'}</h2>
              <Link href="/products" className="text-sm text-[#2563EB] hover:underline flex items-center gap-1">
                {(getSection('categories')?.subtitle || 'View All')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-6 md:-mx-16 px-6 md:px-16">
              {displayCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="shrink-0"
                >
                  <Link href={`/products?category=${cat.slug}`} className="group block">
                    <div className="relative w-40 h-52 md:w-48 md:h-64 rounded-2xl overflow-hidden bg-[#F5F5F0]">
                      <Image
                        src={getImageUrl(cat.image_url) || '/placeholder.svg'}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white font-medium text-sm">{cat.name}</h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* New Arrivals */}
      {isSectionVisible('new-arrivals') && (
        <section className="py-16 md:py-24 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold">{getSection('new-arrivals')?.title || 'New Arrivals'}</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">{getSection('new-arrivals')?.subtitle || 'The latest drops, fresh in.'}</p>
              </div>
              <Link href="/products?sort=newest" className="text-sm text-[#2563EB] hover:underline hidden sm:block">
                {(getSection('new-arrivals')?.subtitle || 'View All')} <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
              </Link>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div key={i} variants={fadeUp}><ProductCardSkeleton /></motion.div>
                  ))
                : newArrivals.map((product, i) => (
                    <motion.div key={product.id} variants={fadeUp}>
                      <ProductCard product={product} priority={i < 4} />
                    </motion.div>
                  ))}
            </motion.div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products?sort=newest">
                <Button variant="outline" size="md">View All New Arrivals</Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* Best Sellers */}
      {isSectionVisible('best-sellers') && (
        <section className="py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold">{getSection('best-sellers')?.title || 'Best Sellers'}</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">{getSection('best-sellers')?.subtitle || 'Most loved products this month.'}</p>
              </div>
              <Link href="/products?sort=bestselling" className="text-sm text-[#2563EB] hover:underline hidden sm:block">
                View All <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
              </Link>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div key={i} variants={fadeUp}><ProductCardSkeleton /></motion.div>
                  ))
                : bestSellers.map((product, i) => (
                    <motion.div key={product.id} variants={fadeUp}>
                      <ProductCard product={product} priority={i < 4} />
                    </motion.div>
                  ))}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Promotional Banner */}
      {isSectionVisible('promo-banner') && (
        <section className="py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            {activeBanners.length > 0 ? (
              activeBanners.map(banner => (
                <div key={banner.id} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af] p-8 md:p-16 text-white mb-6">
                  {banner.image_url && (
                    <Image src={getImageUrl(banner.image_url)} alt="" fill className="object-cover opacity-20" />
                  )}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                  <div className="relative z-10 text-center max-w-2xl mx-auto">
                    {banner.title && (
                      <>
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
                          {banner.title}
                        </span>
                      </>
                    )}
                    {banner.subtitle && (
                      <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{banner.subtitle}</h2>
                    )}
                    {banner.cta_text && banner.cta_link && (
                      <Link href={banner.cta_link}>
                        <Button variant="secondary" size="lg" shimmer>{banner.cta_text}</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af] p-8 md:p-16 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
                    Limited Time Offer
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{getSection('promo-banner')?.title || 'Flash Sale — Up to 40% Off'}</h2>
                  <p className="text-white/80 mb-8">Use code <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">FLASH40</span> at checkout. Don&apos;t miss out!</p>
                  <div className="flex items-center justify-center gap-4 md:gap-6 mb-8">
                    {Object.entries(countdown).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center mb-1">
                          <span className="text-2xl md:text-3xl font-bold">{String(value).padStart(2, '0')}</span>
                        </div>
                        <span className="text-xs text-white/60 uppercase">{key}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/products">
                    <Button variant="secondary" size="lg" shimmer>Shop the Sale</Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Newsletter */}
      {isSectionVisible('newsletter') && (
        <section className="py-16 md:py-24 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-[#2563EB]" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">{getSection('newsletter')?.title || 'Stay in the Loop'}</h2>
              <p className="text-sm text-[#6B6B6B] mb-6">{getSection('newsletter')?.subtitle || 'Be the first to know about new drops, exclusive offers, and style inspiration.'}</p>
              {newsletterSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 text-[#16A34A]">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">You&apos;re subscribed!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <Input type="email" required placeholder="Enter your email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} className="flex-1" />
                  <Button type="submit" variant="primary" shimmer>Subscribe</Button>
                </form>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Testimonials */}
      {isSectionVisible('testimonials') && (
        <section className="py-16 md:py-24 overflow-hidden">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16 mb-10"
          >
            <div className="text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">{getSection('testimonials')?.title || 'What Our Customers Say'}</h2>
              <p className="text-sm text-[#6B6B6B] mt-1">{getSection('testimonials')?.subtitle || 'Real reviews from real people.'}</p>
            </div>
          </motion.div>
          <div className="relative">
            <motion.div
              className="flex gap-6"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {[...displayTestimonials, ...displayTestimonials].map((t, i) => (
                <div key={`${t.id}-${i}`} className="shrink-0 w-72 md:w-80 bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-sm">
                  <StarRating rating={t.rating} size="sm" />
                  <p className="text-sm text-[#1A1A1A] mt-3 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-sm font-bold overflow-hidden">
                      {t.avatar_url ? (
                        <Image src={getImageUrl(t.avatar_url)} alt="" width={40} height={40} className="object-cover" />
                      ) : (
                        t.name[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.role && <p className="text-xs text-[#6B6B6B]">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Instagram/Social Feed */}
      {isSectionVisible('instagram') && (
        <section className="py-16 md:py-24 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-[1440px] px-6 md:px-16"
          >
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">{getSection('instagram')?.title || `Follow Us ${settings?.site_name ? '@' + settings.site_name.toUpperCase().replace(/\s/g, '') : '@STORE'}`}</h2>
              <p className="text-sm text-[#6B6B6B] mt-1">{getSection('instagram')?.subtitle || 'Tag us for a chance to be featured.'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
                'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80',
                'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
                'https://images.unsplash.com/photo-1469533778471-92a68b3637e5?w=400&q=80',
              ].map((image, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F5F0] group cursor-pointer"
                >
                  <Image
                    src={image}
                    alt="Instagram post"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <InstagramIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Features Bar */}
      {displayFeatures.length > 0 && (
        <section className="py-12 border-t border-[rgba(0,0,0,0.04)]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {displayFeatures.map((feature, i) => {
                const Icon = iconMap[feature.icon_name] || Truck
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#2563EB]/5 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <h4 className="text-sm font-semibold mb-0.5">{feature.title}</h4>
                    {feature.description && <p className="text-xs text-[#6B6B6B]">{feature.description}</p>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}
