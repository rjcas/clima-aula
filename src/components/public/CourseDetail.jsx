import { ArrowLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { DIMENSIONS } from '../../data/seedData'
import ScoreBar from '../ui/ScoreBar'

export default function CourseDetail({ course, history, onBack }) {
  if (!course) return null

  const hasHistory = history.length > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium w-fit"
      >
        <ArrowLeft size={16} />
        Volver al ranking
      </button>

      {/* Header */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-200 mb-1">Ficha del curso</p>
        <h2 className="text-3xl font-bold">{course.label}</h2>
        <div className="flex gap-4 mt-3">
          <Stat label="Este mes"  value={course.avgMonth}  />
          <Stat label="Esta semana" value={course.avgWeek} />
          <Stat label="Hoy"       value={course.avgDay}   />
        </div>
      </div>

      {/* Gráfico histórico */}
      {hasHistory ? (
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-4">Evolución diaria (últimos 30 días)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={history} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(history.length / 5)}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                formatter={(v) => [`${v} ⭐`, 'Promedio']}
              />
              <ReferenceLine y={3} stroke="#e2e8f0" strokeDasharray="4 2" />
              <Line
                type="monotone"
                dataKey="promedio"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card text-center py-8 text-slate-400 text-sm">
          No hay datos históricos aún.
        </div>
      )}

      {/* Dimensiones */}
      <div className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Desglose por dimensión</p>
        <div className="flex flex-col gap-3">
          {DIMENSIONS.map(dim => (
            <div key={dim.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">
                  {dim.icon} {dim.label}
                </span>
              </div>
              <ScoreBar score={course.dimensions[dim.id] ?? 0} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{course.totalEvals}</p>
          <p className="text-xs text-slate-400 mt-1">Evaluaciones totales</p>
        </div>
        <div className="card text-center">
          <p className={`text-2xl font-bold ${course.improvement >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {course.improvement >= 0 ? '+' : ''}{course.improvement}
          </p>
          <p className="text-xs text-slate-400 mt-1">vs. mes anterior</p>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-primary-200">{label}</p>
      <p className="text-lg font-bold text-white">
        {value > 0 ? `${value.toFixed(1)} ⭐` : '—'}
      </p>
    </div>
  )
}
