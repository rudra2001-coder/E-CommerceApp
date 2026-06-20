'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ full_name: form.full_name, phone: form.phone })
        .eq('id', user.id)
      await refreshProfile()
      toast('Profile updated!', 'success')
    } catch {
      toast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <h2 className="font-serif text-2xl font-bold">Account Settings</h2>
        <p className="text-sm text-[#6B6B6B]">Manage your personal information.</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full bg-[#2563EB]/10 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-[#2563EB]" />
            )}
            <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <p className="font-medium">{form.full_name || 'User'}</p>
            <p className="text-sm text-[#6B6B6B]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            id="full_name"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          />
          <Input
            label="Email"
            id="email"
            value={user?.email || ''}
            disabled
          />
          <Input
            label="Phone"
            id="phone"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)]">
        <h3 className="font-medium mb-2">Password</h3>
        <p className="text-sm text-[#6B6B6B] mb-4">You can reset your password from the login page.</p>
        <Button variant="outline" size="md" onClick={async () => {
          if (user?.email) {
            await supabase.auth.resetPasswordForEmail(user.email)
            toast('Password reset email sent', 'success')
          }
        }}>
          Reset Password
        </Button>
      </motion.div>
    </div>
  )
}
