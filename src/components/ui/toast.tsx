'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#16A34A]" />,
    error: <AlertCircle className="w-5 h-5 text-[#DC2626]" />,
    info: <Info className="w-5 h-5 text-[#2563EB]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
  }

  const borders = {
    success: 'border-l-[#16A34A]',
    error: 'border-l-[#DC2626]',
    info: 'border-l-[#2563EB]',
    warning: 'border-l-[#F59E0B]',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 bg-white rounded-xl shadow-lg border border-[rgba(0,0,0,0.06)] px-4 py-3 min-w-[320px] border-l-4',
                borders[toast.type]
              )}
            >
              {icons[toast.type]}
              <p className="flex-1 text-sm text-[#1A1A1A]">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
                <X className="w-4 h-4" />
              </button>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[rgba(0,0,0,0.1)]"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
