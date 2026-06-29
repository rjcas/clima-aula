import { useState } from 'react'

export default function StarRating({ value, onChange, scale, size = 'md', readonly = false }) {
  const [hovered, setHovered] = useState(0)

  const sizes = {
    sm: 'text-2xl gap-1',
    md: 'text-3xl gap-1.5',
    lg: 'text-4xl gap-2',
  }

  const active  = hovered || value
  const label   = scale?.[active - 1] ?? ''

  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`flex ${sizes[size]}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`
              leading-none transition-transform duration-100 select-none
              ${!readonly ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
              ${star <= active ? 'opacity-100' : 'opacity-25'}
            `}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            ⭐
          </button>
        ))}
      </div>
      {label && (
        <span className="text-xs font-medium text-slate-500 h-4 transition-all duration-150">
          {label}
        </span>
      )}
    </div>
  )
}
