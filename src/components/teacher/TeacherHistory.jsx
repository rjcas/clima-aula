import { useState, useEffect } from 'react'
import { DIMENSIONS } from '../../data/seedData'
import { StorageService } from '../../services/storage'
import StarRating from '../ui/StarRating'

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `Hace ${mins} min`
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${days} día${days > 1 ? 's' : ''}`
}

export default function TeacherHistory({ teacherId }) {
  const [evals, setEvals]     = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [evalsData, coursesData] = await Promise.all([
        StorageService.getEvaluationsByTeacher(teacherId),
        StorageService.getCourses(),
      ])
      setEvals(evalsData)
      setCourses(coursesData)
      setLoading(false)
    }
    load()
  }, [teacherId])

  const courseLabel = (id) => courses.find(c => c.id === id)?.label ?? id

  if (loading) return (
    <div className="text-center py-10 text-slate-400 text-sm">Cargando...</div>
  )

  if (!evals.length) return (
    <div className="text-center py-10 text-slate-400">
      <p className="text-3xl mb-2">📋</p>
      <p className="text-sm">Todavía no cargaste evaluaciones.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {evals.map(e => (
        <div key={e.id} className="card flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800">
                {courseLabel(e.courseId)} · {e.subject}
              </p>
              <p className="text-xs text-slate-400">{timeAgo(e.timestamp)}</p>
            </div>
            <span className="text-xl font-bold text-blue-600 shrink-0">
              {e.average} ⭐
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {DIMENSIONS.map(dim => (
              <div key={dim.id} className="flex items-center gap-1.5">
                <span className="text-sm">{dim.icon}</span>
                <StarRating value={e.dimensions[dim.id]} readonly size="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
