export default function ScoreBar({ score, max = 5, showLabel = true }) {
  const pct = Math.round((score / max) * 100)

  const color =
    score >= 4.5 ? 'bg-emerald-500' :
    score >= 3.5 ? 'bg-blue-500' :
    score >= 2.5 ? 'bg-amber-500' :
    'bg-red-400'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-700 w-8 text-right">
          {score > 0 ? score.toFixed(1) : '—'}
        </span>
      )}
    </div>
  )
}
