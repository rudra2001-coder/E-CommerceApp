'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { adminApi } from '@/lib/admin-fetch'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import type { FaqItem } from '@/types'

const categoryOptions = ['General', 'Orders', 'Shipping', 'Returns', 'Payment', 'Account', 'Products']

export default function AdminFaq() {
  const { toast } = useToast()
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const [form, setForm] = useState({ category: 'General', question: '', answer: '', is_active: true })
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.select('faq_items', [], { order: { column: 'sort_order', ascending: true } })
      setItems((data || []) as FaqItem[])
    } finally { setLoading(false) }
  }

  function openModal(item?: FaqItem) {
    if (item) {
      setEditing(item)
      setForm({ category: item.category, question: item.question, answer: item.answer, is_active: item.is_active })
    } else {
      setEditing(null)
      setForm({ category: 'General', question: '', answer: '', is_active: true })
    }
    setModalOpen(true)
  }

  async function save() {
    try {
      const data = { category: form.category, question: form.question, answer: form.answer, is_active: form.is_active, sort_order: editing?.sort_order || items.length }
      if (editing) {
        await adminApi.update('faq_items', data, [{ method: 'eq', column: 'id', value: editing.id }])
      } else {
        await adminApi.insert('faq_items', data)
      }
      toast('FAQ saved', 'success')
      setModalOpen(false)
      load()
    } catch { toast('Save failed', 'error') }
  }

  async function remove() {
    if (!deleteTarget) return
    try {
      await adminApi.delete('faq_items', [{ method: 'eq', column: 'id', value: deleteTarget.id }])
      toast('FAQ deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch { toast('Delete failed', 'error') }
  }

  async function toggleActive(item: FaqItem) {
    await adminApi.update('faq_items', { is_active: !item.is_active }, [{ method: 'eq', column: 'id', value: item.id }])
    setItems(prev => prev.map(f => f.id === item.id ? { ...f, is_active: !f.is_active } : f))
  }

  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">FAQ Management</h1>
        <Button onClick={() => openModal()} shimmer><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([category, faqs]) => (
          <div key={category} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-3 bg-[#F8F9FA] border-b border-[rgba(0,0,0,0.06)]">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">{category} <span className="text-[#6B6B6B] font-normal">({faqs.length})</span></h3>
            </div>
            <div className="divide-y divide-[rgba(0,0,0,0.04)]">
              {faqs.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleActive(item) } }}
                        onClick={e => { e.stopPropagation(); toggleActive(item) }}
                        className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${item.is_active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}
                      >
                        {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium">{item.question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item) } }}
                        onClick={e => { e.stopPropagation(); openModal(item) }}
                        className="p-1.5 rounded-lg cursor-pointer text-[#6B6B6B] hover:bg-[#E5E5E5] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDeleteTarget(item) } }}
                        onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                        className="p-1.5 rounded-lg cursor-pointer text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="pl-10 pr-16">
                        <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-[#6B6B6B] bg-white rounded-2xl border border-[rgba(0,0,0,0.06)]">
            <p>No FAQ items yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Question' : 'Add Question'}</h3>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white">
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Question" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Answer</label>
            <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} className="w-full px-3 py-2 text-sm border border-[rgba(0,0,0,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
          </div>
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
          <h3 className="text-lg font-semibold mb-2">Delete FAQ</h3>
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
