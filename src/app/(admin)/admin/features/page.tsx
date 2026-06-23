'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, GripVertical, Eye, EyeOff, Truck, Shield, RotateCcw, Clock, Award, Headphones, Zap, Heart, Gift, DollarSign } from 'lucide-react'
import { adminApi } from '@/lib/admin-fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import type { Feature } from '@/types'

const iconMap: Record<string, any> = { Truck, Shield, RotateCcw, Clock, Award, Headphones, Zap, Heart, Gift, DollarSign }

const iconOptions = Object.keys(iconMap)

export default function AdminFeatures() {
  const { toast } = useToast()
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Feature | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon_name: 'Truck', is_active: true })
  const [deleteTarget, setDeleteTarget] = useState<Feature | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.select('features', [], { order: { column: 'sort_order', ascending: true } })
      setFeatures((data || []) as Feature[])
    } finally { setLoading(false) }
  }

  function openModal(item?: Feature) {
    if (item) {
      setEditing(item)
      setForm({ title: item.title, description: item.description || '', icon_name: item.icon_name, is_active: item.is_active })
    } else {
      setEditing(null)
      setForm({ title: '', description: '', icon_name: 'Truck', is_active: true })
    }
    setModalOpen(true)
  }

  async function save() {
    try {
      const data = { title: form.title, description: form.description || null, icon_name: form.icon_name, is_active: form.is_active, sort_order: editing?.sort_order || features.length }
      if (editing) {
        await adminApi.update('features', data, [{ method: 'eq', column: 'id', value: editing.id }])
      } else {
        await adminApi.insert('features', data)
      }
      toast('Feature saved', 'success')
      setModalOpen(false)
      load()
    } catch { toast('Save failed', 'error') }
  }

  async function remove() {
    if (!deleteTarget) return
    try {
      await adminApi.delete('features', [{ method: 'eq', column: 'id', value: deleteTarget.id }])
      toast('Feature deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch { toast('Delete failed', 'error') }
  }

  async function toggleActive(item: Feature) {
    await adminApi.update('features', { is_active: !item.is_active }, [{ method: 'eq', column: 'id', value: item.id }])
    setFeatures(prev => prev.map(f => f.id === item.id ? { ...f, is_active: !f.is_active } : f))
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
        <h1 className="text-xl font-bold text-[#1A1A1A]">Features Bar</h1>
        <Button onClick={() => openModal()} shimmer><Plus className="w-4 h-4 mr-2" /> Add Feature</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item, i) => {
          const Icon = iconMap[item.icon_name] || Truck
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.06)] text-center relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/5 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h4 className="text-sm font-semibold mb-0.5">{item.title}</h4>
              {item.description && <p className="text-xs text-[#6B6B6B]">{item.description}</p>}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(item)} className={`p-1.5 rounded-lg ${item.is_active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                  {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => openModal(item)} className="p-1.5 bg-black/60 rounded-lg text-white">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 bg-black/60 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          )
        })}
        {features.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#6B6B6B]">
            <p>No features yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Feature' : 'Add Feature'}</h3>
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map(name => {
                const Icon = iconMap[name]
                return (
                  <button key={name} onClick={() => setForm(p => ({ ...p, icon_name: name }))} className={`p-2.5 rounded-xl border transition-all ${form.icon_name === name ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]' : 'border-[rgba(0,0,0,0.06)] text-[#6B6B6B] hover:border-[rgba(0,0,0,0.12)]'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>
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
          <h3 className="text-lg font-semibold mb-2">Delete Feature</h3>
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
