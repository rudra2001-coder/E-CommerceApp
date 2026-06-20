'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { StarRating } from './StarRating'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
  className?: string
}

export default function ReviewForm({ productId, onSuccess, className }: ReviewFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = rating > 0 && title.trim().length > 0 && body.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim(),
        body: body.trim(),
      })

      if (error) throw error

      toast('Review submitted successfully!', 'success')
      setRating(0)
      setTitle('')
      setBody('')
      onSuccess?.()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to submit review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className={cn('p-6 bg-[#F5F5F0] rounded-2xl text-center', className)}>
        <p className="text-sm text-[#6B6B6B]">Please sign in to leave a review.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Your Rating
        </label>
        <StarRating
          rating={rating}
          size={28}
          interactive
          onChange={setRating}
        />
        {rating === 0 && (
          <p className="text-xs text-[#DC2626] mt-1">Please select a rating</p>
        )}
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full h-11 px-4 text-sm bg-white border border-[rgba(0,0,0,0.12)] rounded-xl placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#2563EB] transition-colors duration-200"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          className="w-full px-4 py-3 text-sm bg-white border border-[rgba(0,0,0,0.12)] rounded-xl placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#2563EB] transition-colors duration-200 resize-none"
        />
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          loading={submitting}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </motion.div>
    </form>
  )
}
