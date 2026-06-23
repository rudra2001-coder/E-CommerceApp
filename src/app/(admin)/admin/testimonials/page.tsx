'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Trash2, Star, StarHalf, GripVertical, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/lib/admin-fetch'
import { getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import type { Testimonial } from '@/types'

export default function AdminTestimonials() {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5, avatar_url: '', is_active: true })
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.select('testimonials', [], { order: { column: 'sort_order', ascending: true } })
      setTestimonials((data || []) as Testimonial[])
    } finally { setLoading(false) }
  }

  function openModal(item?: Testimonial) {
    if (item) {
      setEditing(item)
      setForm({ name: item.name, role: item.role || '', text: item.text, rating: item.rating, avatar_url: item.avatar_url || '', is_active: item.is_active })
    } else {
      setEditing(null)
      setForm({ name: '', role: '', text: '', rating: 5, avatar_url: '', is_active: true })
    }
    setModalOpen(true)
  }

  async function save() {
    try {
      const data = { name: form.name, role: form.role || null, text: form.text, rating: form.rating, avatar_url: form.avatar_url || null, is_active: form.is_active, sort_order: editing?.sort_order || testimonials.length }
      if (editing) {
        await adminApi.update('testimonials', data, [{ method: 'eq', column: 'id', value: editing.id }])
      } else {
        await adminApi.insert('testimonials', data)
      }
      toast('Testimonial saved', 'success')
      setModalOpen(false)
      load()
    } catch { toast('Save failed', 'error') }
  }

  async function remove() {
    if (!deleteTarget) return
    try {
      await adminApi.delete('testimonials', [{ method: 'eq', column: 'id', value: deleteTarget.id }])
      toast('Testimonial deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch { toast('Delete failed', 'error') }
  }

  async function toggleActive(item: Testimonial) {
    await adminApi.update('testimonials', { is_active: !item.is_active }, [{ method: 'eq', column: 'id', value: item.id }])
    setTestimonials(prev => prev.map(t => t.id === item.id ? { ...t, is_active: !t.is_active } : t))
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Testimonials</h1>
        <Button onClick={() => openModal()} shimmer><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.06)] relative group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-sm font-bold overflow-hidden">
                  {item.avatar_url ? (
                    <Image src={getImageUrl(item.avatar_url)} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    item.name[0]
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.role && <p className="text-xs text-[#6B6B6B]">{item.role}</p>}
                </div>
              </div>
              <button
                onClick={() => toggleActive(item)}
                className={`p-1.5 rounded-lg ${item.is_active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}
              >
                {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`w-3.5 h-3.5 ${j < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">&ldquo;{item.text}&rdquo;</p>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(item)} className="p-1.5 bg-black/60 rounded-lg text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => setDeleteTarget(item)} className="p-1.5 bg-black/60 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#6B6B6B]">
            <p>No testimonials yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
          <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Role (optional)" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Testimonial</label>
            <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <button key={j} onClick={() => setForm(p => ({ ...p, rating: j + 1 }))}>
                  <Star className={`w-6 h-6 ${j < form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} hover:text-amber-300 transition-colors`} />
                </button>
              ))}
            </div>
          </div>
          <Input label="Avatar URL (optional)" value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" /> Active
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Delete Testimonial</h3>
          <p className="text-sm text-[#6B6B6B] mb-4">Are you sure?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
