import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { getDimensionsForRole } from '../../data/seedData'
import { StorageService } from '../../services/storage'
import StarRating from '../ui/StarRating'

const emptyScores = () => ({
  clima: null, espacio: null, participacion: null, convivencia: null,
})

export default function TeacherForm({ teacher, onSaved }) {
  const [courses,  setCourses]  = useState([])
  const [subjects, setSubjects] = useState([])
  const [courseId, setCourseId] = useState('')
  const [subject,  setSubject]  = useState('')
  const [scores,   setScores]   = useState(emptyScores())
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(true)

  const dimensions = getDimensionsForRole(teacher.role)
  const isPreceptor = teacher.role === 'preceptor'

  useEffect(() => {
    async function load() {
      const [c, s] = await Promise.all([
        StorageService.getCourses(),
        StorageService.getSubjects(),
      ])
      setCourses(c)
      // Preceptores no necesitan elegir materia
      setSubjects(s)
      setLoading(false)
    }
    load()
  }, [])

  const allFilled =
    courseId &&
    (isPreceptor || subject) &&
    dimensions.every(d => scores[d.id] !== null && scores[d.id] > 0)

  const average = allFilled
    ? +(dimensions.reduce((a, d) => a + scores[d.id], 0) / dimensions.length).toFixed(2)
    : 0

  async function handleSubmit() {
    if (!allFilled) return

    const evaluation = {
      id:          `eval_${Date.now()}`,
      timestamp:   new Date().toISOString(),
      teacherId:   teacher.id,
      teacherName: teacher.name,
      courseId,
      subject:     isPreceptor ? 'Preceptoría' : subject,
      role:        teacher.role,
      dimensions:  { ...scores },
      average,
    }

    await onSaved(evaluation)
    setSaved(true)

    setTimeout(() => {
      setScores(emptyScores())
      setCourseId('')
      setSubject('')
      setSaved(false)
    }, 2500)
  }

  if (loading) return (
    <div className="text-center py-16 text-slate-400 text-sm">Cargando...</div>
  )

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="text-emerald-500" size={56} strokeWidth={1.5} />
        <p className="text-xl font-semibold text-slate-700">¡Evaluación guardada!</p>
        <p className="text-slate-400 text-sm">Promedio: {average} ⭐</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Badge de rol */}
      <div className={`
        rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2
        ${isPreceptor
          ? 'bg-purple-50 text-purple-700 border border-purple-200'
          : 'bg-secondary-50 text-secondary-700 border border-secondary-200'}
      `}>
        <span>{isPreceptor ? '🤝' : '📚'}</span>
        {isPreceptor
          ? 'Modo preceptor — evaluás Convivencia y vínculos'
          : 'Modo docente — evaluás Clima, Espacio y Participación'}
      </div>

      {/* Selectores */}
      <div className={`grid gap-3 ${isPreceptor ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Curso
          </label>
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base
                       font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">— Elegí —</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {!isPreceptor && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Materia
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base
                         font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Elegí —</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dimensiones según rol */}
      <div className="flex flex-col gap-3">
        {dimensions.map(dim => (
          <div key={dim.id} className="card flex flex-col gap-2">
            <div>
              <p className="font-semibold text-slate-800 leading-tight">
                {dim.icon} {dim.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {dim.description}
              </p>
            </div>
            <StarRating
              value={scores[dim.id] ?? 0}
              onChange={val => setScores(prev => ({ ...prev, [dim.id]: val }))}
              scale={dim.scale}
              size="md"
            />
          </div>
        ))}
      </div>

      {/* Promedio en tiempo real */}
      {allFilled && (
        <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
          <span className="text-sm font-medium text-primary-600">Promedio de esta evaluación</span>
          <span className="text-2xl font-bold text-primary-600">{average} ⭐</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allFilled}
        className="btn-primary w-full text-base py-4"
      >
        Guardar evaluación
      </button>
    </div>
  )
}
