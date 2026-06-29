const VARIANTS = {
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  green:  'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  gray:   'bg-slate-100 text-slate-600 border-slate-200',
  gold:   'bg-amber-100 text-amber-700 border-amber-200',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
      ${VARIANTS[variant]} ${className}
    `}>
      {children}
    </span>
  )
}
