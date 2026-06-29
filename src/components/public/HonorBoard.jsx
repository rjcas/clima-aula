import { useState, useEffect } from 'react'
import { StorageService } from '../../services/storage'

export default function HonorBoard({ honors }) {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    StorageService.getCourses().then(setCourses)
  }, [])

  const label = (id) => courses.find(c => c.id === id)?.label ?? id
  const { bestAvg, bestImprovement } = honors

  if (!bestAvg && !bestImprovement) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Aún no hay suficientes datos para el mes actual.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {bestAvg && (
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Mejor promedio del mes
              </p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {label(bestAvg.id)}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Promedio: <strong className="text-amber-700">{bestAvg.avgMonth.toFixed(1)} ⭐</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {bestImprovement && bestImprovement.id !== bestAvg?.id && (
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <span className="text-4xl">📈</span>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Mayor mejora respecto al mes anterior
              </p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">
                {label(bestImprovement.id)}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Mejoró <strong className="text-emerald-700">+{bestImprovement.improvement} puntos</strong> respecto al mes pasado
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
