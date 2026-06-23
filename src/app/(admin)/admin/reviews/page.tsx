'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Star, Trash2, Filter } from 'lucide-react'
import { adminApi } from '@/lib/admin-fetch'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import type { Review } from '@/types'

export default function AdminReviews() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.select('reviews', [], { order: { column: 'created_at', ascending: false } })
      setReviews((data || []) as Review[])
    } finally { setLoading(false) }
  }

  async function approve(review: Review) {
    try {
      await adminApi.update('reviews', { is_approved: true }, [{ method: 'eq', column: 'id', value: review.id }])
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: true } : r))
      toast('Review approved', 'success')
    } catch { toast('Failed to approve', 'error') }
  }

  async function reject(review: Review) {
    try {
      await adminApi.update('reviews', { is_approved: false }, [{ method: 'eq', column: 'id', value: review.id }])
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: false } : r))
      toast('Review rejected', 'info')
    } catch { toast('Failed to reject', 'error') }
  }

  async function remove() {
    if (!deleteTarget) return
    try {
      await adminApi.delete('reviews', [{ method: 'eq', column: 'id', value: deleteTarget.id }])
      toast('Review deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch { toast('Delete failed', 'error') }
  }

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved
    if (filter === 'approved') return r.is_approved
    return true
  })

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Reviews</h1>
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.06)]">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize', filter === f ? 'bg-[#2563EB] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F5F0]')}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-sm font-bold">
                    {'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">User</p>
                    <p className="text-xs text-[#6B6B6B]">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {review.is_verified && <span className="text-[10px] font-medium text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">Verified</span>}
                  {review.is_approved ? (
                    <span className="text-[10px] font-medium text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">Approved</span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded-full">Pending</span>
                  )}
                </div>
                {review.title && <p className="text-sm font-semibold mb-0.5">{review.title}</p>}
                {review.body && <p className="text-sm text-[#6B6B6B]">{review.body}</p>}
              </div>
              <div className="flex items-center gap-1 ml-4">
                {!review.is_approved ? (
                  <button onClick={() => approve(review)} className="p-2 rounded-lg bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0] transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => reject(review)} className="p-2 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setDeleteTarget(review)} className="p-2 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6B6B6B]">
            <p>No reviews found</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Delete Review</h3>
          <p className="text-sm text-[#6B6B6B] mb-4">This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
