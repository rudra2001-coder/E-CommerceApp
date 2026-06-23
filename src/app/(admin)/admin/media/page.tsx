'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Upload, Trash2, Copy, ImageIcon, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'

interface MediaFile {
  name: string
  url: string
  updated_at: string
}

export default function AdminMedia() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null)

  useEffect(() => { loadFiles() }, [])

  async function loadFiles() {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from('product-images').list('', { sortBy: { column: 'updated_at', order: 'desc' } })
      if (error) throw error
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      setFiles((data || []).map(f => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/product-images/${f.name}`,
        updated_at: f.updated_at || '',
      })))
    } catch (err: any) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const uploadFiles = async (fileList: FileList | File[]) => {
    setUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(fileName, file)
        if (error) throw error
      }
      toast('Files uploaded', 'success')
      loadFiles()
    } catch (err: any) {
      toast(err.message || 'Upload failed', 'error')
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }

  const deleteFile = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.storage.from('product-images').remove([deleteTarget.name])
      if (error) throw error
      toast('File deleted', 'success')
      setDeleteTarget(null)
      loadFiles()
    } catch (err: any) {
      toast(err.message || 'Delete failed', 'error')
    }
  }

  const copyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(file.url)
      setCopiedId(file.name)
      setTimeout(() => setCopiedId(null), 2000)
      toast('URL copied', 'success')
    } catch {
      toast('Failed to copy', 'error')
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Media Library</h1>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) uploadFiles(e.target.files) }} />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading} shimmer>
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center transition-all',
          dragging ? 'border-[#2563EB] bg-blue-50' : 'border-[rgba(0,0,0,0.12)]'
        )}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-[#6B6B6B]" />
        <p className="text-sm text-[#6B6B6B]">Drop images here or click Upload</p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 text-[#6B6B6B]">No images uploaded yet</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group aspect-square rounded-xl overflow-hidden bg-[#F5F5F0] border border-[rgba(0,0,0,0.06)]"
            >
              <Image src={file.url} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(file)} className="p-2 bg-white rounded-lg text-[#1A1A1A] hover:bg-[#F5F5F0]">
                  {copiedId === file.name ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => setDeleteTarget(file)} className="p-2 bg-white rounded-lg text-[#DC2626] hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Delete File</h3>
          <p className="text-sm text-[#6B6B6B] mb-4">Are you sure you want to delete this file?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteFile}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
