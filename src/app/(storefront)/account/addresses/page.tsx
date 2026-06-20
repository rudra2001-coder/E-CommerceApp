'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import type { Address } from '@/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const emptyForm = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  is_default: false,
}

export default function AddressesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchAddresses = async () => {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      if (data) setAddresses(data)
      setLoading(false)
    }
    fetchAddresses()
  }, [user])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditingId(address.id)
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      is_default: address.is_default,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = { ...form, user_id: user.id }
      if (editingId) {
        await supabase.from('addresses').update(payload).eq('id', editingId)
        toast('Address updated', 'success')
      } else {
        await supabase.from('addresses').insert(payload)
        toast('Address added', 'success')
      }
      setModalOpen(false)
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      if (data) setAddresses(data)
    } catch {
      toast('Failed to save address', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('addresses').delete().eq('id', id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast('Address deleted', 'success')
    } catch {
      toast('Failed to delete address', 'error')
    }
  }

  const setDefault = async (id: string) => {
    if (!user) return
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
    if (data) setAddresses(data)
    toast('Default address updated', 'success')
  }

  return (
    <div>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold">Addresses</h2>
          <p className="text-sm text-[#6B6B6B]">Manage your shipping addresses.</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Address
        </Button>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-[#F5F5F0] rounded-2xl animate-pulse" />)}
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map(addr => (
            <motion.div key={addr.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-[#6B6B6B] shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-semibold rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B6B6B]">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                    <p className="text-sm text-[#6B6B6B]">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-sm text-[#6B6B6B]">{addr.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)} className="p-2 rounded-lg hover:bg-[#F5F5F0] text-[#6B6B6B] hover:text-[#2563EB] transition-colors" title="Set as default">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(addr)} className="p-2 rounded-lg hover:bg-[#F5F5F0] text-[#6B6B6B] hover:text-[#2563EB] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#6B6B6B] hover:text-[#DC2626] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-16 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#6B6B6B]" />
          </div>
          <h3 className="font-serif text-lg font-bold mb-2">No addresses saved</h3>
          <p className="text-sm text-[#6B6B6B] mb-6">Add a shipping address for faster checkout.</p>
          <Button variant="primary" onClick={openCreate}>Add Address</Button>
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-6">
          <h3 className="font-serif text-lg font-bold mb-4">{editingId ? 'Edit Address' : 'Add Address'}</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name" id="addr_name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              <Input label="Phone" id="addr_phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <Input label="Address Line 1" id="addr_line1" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} />
            <Input label="Address Line 2 (Optional)" id="addr_line2" value={form.address_line2} onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))} />
            <div className="grid md:grid-cols-3 gap-4">
              <Input label="City" id="addr_city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              <Input label="State" id="addr_state" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
              <Input label="ZIP Code" id="addr_zip" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
            </div>
            <Input label="Country" id="addr_country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                className="w-4 h-4 rounded border-[rgba(0,0,0,0.2)] text-[#2563EB]"
              />
              <span className="text-sm">Set as default address</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
