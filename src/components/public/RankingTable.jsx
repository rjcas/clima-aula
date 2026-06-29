import ScoreBar from '../ui/ScoreBar'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function RankingTable({ ranking, onSelectCourse }) {
  if (!ranking.length) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-sm">Aún no hay evaluaciones cargadas.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {ranking.map(course => (
        <button
          key={course.id}
          onClick={() => onSelectCourse(course.id)}
          className="card flex items-center gap-4 text-left w-full hover:border-primary-200
                     hover:shadow-md transition-all duration-150 active:scale-[0.99]"
        >
          {/* Posición */}
          <div className="flex flex-col items-center w-10 shrink-0">
            <span className="text-2xl leading-none">
              {MEDALS[course.rank] ?? course.rank}
            </span>
            {!MEDALS[course.rank] && (
              <span className="text-xs text-slate-400 font-medium">#{course.rank}</span>
            )}
          </div>

          {/* Nombre + barra */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-semibold text-slate-800">{course.label}</p>
              <span className="text-sm font-bold text-primary-500 ml-2 shrink-0">
                {course.avgMonth > 0 ? course.avgMonth.toFixed(1) : '—'}
              </span>
            </div>
            <ScoreBar score={course.avgMonth} showLabel={false} />
            <p className="text-xs text-slate-400 mt-1">
              {course.totalEvals} evaluación{course.totalEvals !== 1 ? 'es' : ''} este mes
              {course.improvement > 0 && (
                <span className="text-accent-green ml-2">▲ +{course.improvement}</span>
              )}
              {course.improvement < 0 && (
                <span className="text-red-500 ml-2">▼ {course.improvement}</span>
              )}
            </p>
          </div>

          <span className="text-slate-300 text-lg shrink-0">›</span>
        </button>
      ))}
    </div>
  )
}
