'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md'
}

export function QuantitySelector({ value, min = 1, max = 99, onChange, size = 'md' }: QuantitySelectorProps) {
  return (
    <div className={cn(
      'inline-flex items-center border border-[rgba(0,0,0,0.12)] rounded-xl overflow-hidden',
      size === 'sm' ? 'h-9' : 'h-11'
    )}>
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center transition-colors hover:bg-[#F5F5F0] disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' ? 'w-9' : 'w-11'
        )}
      >
        <Minus className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      </button>
      <span className={cn(
        'text-center font-medium select-none border-x border-[rgba(0,0,0,0.06)]',
        size === 'sm' ? 'w-9 text-xs' : 'w-12 text-sm'
      )}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center transition-colors hover:bg-[#F5F5F0] disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' ? 'w-9' : 'w-11'
        )}
      >
        <Plus className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      </button>
    </div>
  )
}
