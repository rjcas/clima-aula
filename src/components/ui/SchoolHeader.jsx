export default function SchoolHeader({ subtitle = '', dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Logo Escuela Dr. Ángel Gutiérrez"
        className="w-9 h-9 object-contain shrink-0"
      />
      <div>
        <p className={`font-bold leading-tight text-sm ${dark ? 'text-white' : 'text-slate-800'}`}>
          Escuela Dr. Ángel Gutiérrez
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
