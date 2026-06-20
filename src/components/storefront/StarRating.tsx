'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: number | 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
  showValue?: boolean
}

const sizeMap = { sm: 14, md: 18, lg: 24 }

export function StarRating({
  rating,
  size = 'sm',
  interactive = false,
  onChange,
  className,
  showValue,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const displayRating = interactive && hovered > 0 ? hovered : rating
  const pixelSize = typeof size === 'string' ? sizeMap[size] : size

  const handleClick = (starValue: number) => {
    if (interactive && onChange) onChange(starValue)
  }

  const handleMouseEnter = (starValue: number) => {
    if (interactive) setHovered(starValue)
  }

  const handleMouseLeave = () => {
    if (interactive) setHovered(0)
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const filled = displayRating >= starValue

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'transition-colors duration-150',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              filled ? 'text-[#F59E0B]' : 'text-[#D1D1D1]'
            )}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star size={pixelSize} fill={filled ? 'currentColor' : 'none'} />
          </button>
        )
      })}
      {showValue && (
        <span className="text-xs text-[#6B6B6B] ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
