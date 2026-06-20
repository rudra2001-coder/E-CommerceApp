'use client'

import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none',
              focused || hasValue
                ? '-top-2.5 text-xs text-[#2563EB] bg-white px-1'
                : 'top-3 text-sm text-[#6B6B6B]',
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full h-11 px-3 text-sm bg-white border rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
            'placeholder:text-[#6B6B6B]',
            error ? 'border-[#DC2626]' : 'border-[rgba(0,0,0,0.12)] hover:border-[rgba(0,0,0,0.25)]',
            label && 'pt-4 pb-1',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
