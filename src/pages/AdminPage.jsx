import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, BarChart2, LogOut,
         UserPlus, Users, Eye, EyeOff, CheckCircle, XCircle,
         FileText, FileSpreadsheet, KeyRound } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { createClient } from '@supabase/supabase-js'
import { DIMENSIONS } from '../data/seedData'
import { StorageService } from '../services/storage'
import { exportPDF, exportExcel } from '../services/reports'
import ScoreBar from '../components/ui/ScoreBar'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Cambio de contraseña admin ────────────────────────────────────────────────
function ChangeAdminPassword({ onClose }) {
  const [pw1,     setPw1]     = useState('')
  const [pw2,     setPw2]     = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (pw1.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (pw1 !== pw2)    { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw1 })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <KeyRound size={18} className="text-blue-600" /> Cambiar contraseña
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-emerald-700 font-medium">Contraseña actualizada correctamente.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw1}
                  onChange={e => setPw1(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Repetir contraseña
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw2}
                onChange={e => setPw2(e.target.value)}
                placeholder="Repetí la contraseña"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Login de directora ────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { user, error } = await StorageService.adminLogin(email, password)
    if (error) { setError(error); setLoading(false); return }
    onLogin(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 to-slate-900
                    flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-2" />
        <h1 className="text-xl font-bold text-white">Escuela Dr. Ángel Gutiérrez</h1>
        <p className="text-slate-400 text-sm mt-1">Clima del Aula — Directivos</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="directora@escuela.edu.ar"
            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3
                         text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-xl px-4 py-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

// ── ABM Docentes ──────────────────────────────────────────────────────────────
function TeachersPanel() {
  const [teachers,   setTeachers]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [newTeacher, setNewTeacher] = useState(null)
  const [form,       setForm]       = useState({ name: '', username: '', tempPassword: '', role: 'docente' })
  const [formError,  setFormError]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [showInactive,   setShowInactive]   = useState(false)

  useEffect(() => { loadTeachers() }, [])

  async function loadTeachers() {
    const data = await StorageService.getTeachers()
    setTeachers(data)
    setLoading(false)
  }

  function generateId() { return 'T' + Date.now().toString().slice(-6) }

  function generateTempPassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.username.trim()) { setFormError('El usuario no puede estar vacío'); return }
    if (!/^[a-z0-9._]+$/.test(form.username.trim())) {
      setFormError('Solo minúsculas, números, puntos y guiones bajos')
      return
    }
    if (teachers.some(t => t.username === form.username.trim().toLowerCase())) {
      setFormError('Ese nombre de usuario ya existe')
      return
    }
    setSaving(true)
    const tempPassword = form.tempPassword || generateTempPassword()
    const { error } = await StorageService.createTeacher({
      id: generateId(),
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      tempPassword,
      role: form.role,
    })
    setSaving(false)
    if (error) { setFormError(error); return }
    setNewTeacher({ name: form.name.trim(), username: form.username.trim().toLowerCase(), tempPassword })
    setForm({ name: '', username: '', tempPassword: '', role: 'docente' })
    setShowForm(false)
    setFormError('')
    loadTeachers()
  }

  async function toggleActive(teacher) {
    const fn = teacher.active
      ? StorageService.deactivateTeacher.bind(StorageService)
      : StorageService.reactivateTeacher.bind(StorageService)
    const { data } = await fn(teacher.id)
    if (data) setTeachers(prev => prev.map(t => t.id === data.id ? data : t))
  }

  async function resetPassword(teacher) {
    const tempPassword = generateTempPassword()
    const { error } = await StorageService.resetTeacherPassword(teacher.id, tempPassword)
    if (!error) setNewTeacher({ name: teacher.name, username: teacher.username, tempPassword })
  }

  async function deleteTeacher(teacher) {
    const confirmed = window.confirm(
      `¿Confirmás que querés eliminar a ${teacher.name}?\n\nEsta acción no se puede deshacer. Sus evaluaciones se conservan en el historial.`
    )
    if (!confirmed) return
    const { error } = await StorageService.deleteTeacher(teacher.id)
    if (!error) setTeachers(prev => prev.filter(t => t.id !== teacher.id))
  }

  function handleEditSave(updated) {
    setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t))
    setEditingTeacher(null)
  }

  if (loading) return <div className="text-center py-10 text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Users size={14} /> Docentes y preceptores
        </h2>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
          <UserPlus size={16} /> Agregar
        </button>
      </div>

      {newTeacher && (
        <div className="card border-emerald-200 bg-emerald-50 flex flex-col gap-2">
          <p className="text-sm font-semibold text-emerald-700">Credenciales para {newTeacher.name}</p>
          <p className="text-xs text-slate-600">Comunicale estos datos para su primer ingreso:</p>
          <div className="bg-white rounded-xl border border-emerald-200 px-4 py-3 flex flex-col gap-1">
            <p className="text-sm"><span className="text-slate-400">Usuario:</span> <strong>{newTeacher.username}</strong></p>
            <p className="text-sm"><span className="text-slate-400">Contraseña temporal:</span> <strong>{newTeacher.tempPassword}</strong></p>
          </div>
          <p className="text-xs text-slate-400">El docente deberá cambiarla al primer ingreso.</p>
          <button onClick={() => setNewTeacher(null)} className="text-xs text-slate-400 hover:text-slate-600 self-end">Cerrar</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card border-blue-200 bg-blue-50 flex flex-col gap-3">
          <p className="text-sm font-semibold text-blue-700">Nuevo usuario</p>
          <input type="text" placeholder="Nombre completo" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Nombre de usuario</label>
            <input type="text" placeholder="garcia.maria" autoCapitalize="none" value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required />
            <p className="text-xs text-slate-400">Solo minúsculas, números, puntos y guiones bajos</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Contraseña temporal</label>
              <input type="text" placeholder="Se genera automáticamente" value={form.tempPassword}
                onChange={e => setForm(p => ({ ...p, tempPassword: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Rol</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="docente">Docente</option>
                <option value="preceptor">Preceptor</option>
              </select>
            </div>
          </div>
          {formError && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFormError('') }}
              className="btn-secondary flex-1 py-2.5 text-sm">Cancelar</button>
          </div>
        </form>
      )}

      {editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onSave={handleEditSave}
          onClose={() => setEditingTeacher(null)}
        />
      )}
      <div className="flex flex-col gap-2">
        {teachers
          .filter(t => showInactive ? true : t.active)
          .map(t => (
            <TeacherRow key={t.id} teacher={t} onToggle={toggleActive} onResetPassword={resetPassword} onEdit={setEditingTeacher} />
          ))}
        {teachers.some(t => !t.active) && (
          <button
            onClick={() => setShowInactive(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 text-center py-2 transition-colors"
          >
            {showInactive
              ? '— Ocultar desactivados —'
              : `— Mostrar desactivados (${teachers.filter(t => !t.active).length}) —`}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal edición docente ─────────────────────────────────────────────────────
function EditTeacherModal({ teacher, onSave, onClose }) {
  const [form,  setForm]  = useState({ name: teacher.name, username: teacher.username, role: teacher.role })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim())     { setError('El nombre no puede estar vacío'); return }
    if (!form.username.trim()) { setError('El usuario no puede estar vacío'); return }
    if (!/^[a-z0-9._]+$/.test(form.username.trim())) {
      setError('Usuario: solo minúsculas, números, puntos y guiones bajos')
      return
    }
    setSaving(true)
    const { data, error } = await StorageService.updateTeacherData(teacher.id, form)
    setSaving(false)
    if (error) { setError(error); return }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Editar docente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</label>
            <input type="text" value={form.username} autoCapitalize="none"
              onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g,'') }))}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="docente">Docente</option>
              <option value="preceptor">Preceptor</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeacherRow({ teacher, onToggle, onResetPassword, onEdit }) {
  return (
    <div className={`card flex items-center gap-3 ${!teacher.active ? 'opacity-40' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-800 text-sm truncate">{teacher.name}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0
            ${teacher.role === 'preceptor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {teacher.role}
          </span>
          {!teacher.active && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
              desactivado
            </span>
          )}
          {teacher.must_change_password && teacher.active && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
              contraseña temporal
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <p className="text-xs text-slate-400">@{teacher.username}</p>
          {teacher.active && (
            <>
              <button onClick={() => onEdit(teacher)}
                className="text-xs text-slate-400 hover:text-primary-500 transition-colors">
                editar
              </button>
              <button onClick={() => onResetPassword(teacher)}
                className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                resetear contraseña
              </button>
            </>
          )}
        </div>
      </div>
      <button onClick={() => onToggle(teacher)}
        className={`shrink-0 transition-colors ${teacher.active
          ? 'text-emerald-500 hover:text-slate-400'
          : 'text-slate-300 hover:text-emerald-500'}`}
        title={teacher.active ? 'Desactivar' : 'Reactivar'}>
        {teacher.active ? <CheckCircle size={22} /> : <XCircle size={22} />}
      </button>
    </div>
  )
}

// ── Panel de estadísticas + informes ─────────────────────────────────────────
const MONTH_NAMES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function StatsPanel({ courseStats, ranking, alerts, evaluations }) {
  const [exporting, setExporting] = useState('')
  const now = new Date()
  const [selMonth, setSelMonth] = useState(now.getMonth())
  const [selYear,  setSelYear]  = useState(now.getFullYear())

  // Build year options from evaluations history
  const years = [...new Set(evaluations.map(e => new Date(e.timestamp).getFullYear()))]
    .sort((a, b) => b - a)
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear())

  const top3    = ranking.slice(0, 3)
  const bottom3 = [...ranking].reverse().slice(0, 3)

  const withData = courseStats.filter(c => c.totalEvals > 0)
  const globalDims = DIMENSIONS.map(d => ({
    label: d.label, icon: d.icon,
    avg: withData.length
      ? +(withData.reduce((s, c) => s + (c.dimensions[d.id] ?? 0), 0) / withData.length).toFixed(2)
      : 0,
  }))

  async function handleExport(type) {
    setExporting(type)
    try {
      if (type === 'pdf') {
        await exportPDF({ ranking, courseStats, evaluations, selectedMonth: selMonth, selectedYear: selYear })
      } else {
        exportExcel({ ranking, evaluations, courseStats, selectedMonth: selMonth, selectedYear: selYear })
      }
    } finally {
      setTimeout(() => setExporting(''), 1000)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Selector de período */}
      <div className="card flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-600 shrink-0">Período del informe:</span>
        <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1">
          {MONTH_NAMES_ES.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Botones de exportar */}
      <div className="flex gap-3">
        <button
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3 text-sm"
        >
          <FileText size={16} className="text-red-500" />
          {exporting === 'pdf' ? 'Generando...' : 'Exportar PDF'}
        </button>
        <button
          onClick={() => handleExport('excel')}
          disabled={!!exporting}
          className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3 text-sm"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          {exporting === 'excel' ? 'Generando...' : 'Exportar Excel'}
        </button>
      </div>

      {alerts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Alertas — Cursos en baja
          </h2>
          <div className="flex flex-col gap-2">
            {alerts.map(c => (
              <div key={c.id} className="card border-red-200 bg-red-50 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{c.label}</p>
                  <p className="text-xs text-red-600">
                    Cayó <strong>{Math.abs(c.improvement)} puntos</strong> respecto al mes anterior
                  </p>
                </div>
                <span className="text-red-500 font-bold text-sm shrink-0">{c.avgMonth.toFixed(1)} ⭐</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Promedios institucionales
        </h2>
        <div className="card flex flex-col gap-3">
          {globalDims.map(d => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">{d.icon} {d.label}</span>
              </div>
              <ScoreBar score={d.avg} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section>
          <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} /> Mejores del mes
          </h2>
          <div className="flex flex-col gap-2">
            {top3.map((c, i) => (
              <div key={c.id} className="card flex items-center gap-3">
                <span className="text-xl">{['🥇','🥈','🥉'][i]}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{c.label}</p>
                  <ScoreBar score={c.avgMonth} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingDown size={14} /> Necesitan atención
          </h2>
          <div className="flex flex-col gap-2">
            {bottom3.map(c => (
              <div key={c.id} className="card flex items-center gap-3">
                <span className="text-xl">📌</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{c.label}</p>
                  <ScoreBar score={c.avgMonth} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Perfil por curso
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ranking.map(c => {
            const data = DIMENSIONS.map(d => ({ dim: d.label, valor: c.dimensions[d.id] ?? 0 }))
            return (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-800">{c.label}</p>
                  <span className="text-blue-600 font-bold">{c.avgMonth.toFixed(1)} ⭐</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip formatter={(v) => [`${v.toFixed(1)} ⭐`, 'Puntaje']} />
                    <Radar dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// ── Página Admin principal ────────────────────────────────────────────────────
export default function AdminPage({ courseStats, ranking, alerts, evaluations }) {
  const [admin,          setAdmin]          = useState(null)
  const [checking,       setChecking]       = useState(true)
  const [tab,            setTab]            = useState('stats')
  const [showChangePw,   setShowChangePw]   = useState(false)

  useEffect(() => {
    async function checkSession() {
      const session = await StorageService.getAdminSession()
      setAdmin(session)
      setChecking(false)
    }
    checkSession()
  }, [])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <p className="text-slate-400 text-sm">Verificando sesión...</p>
    </div>
  )

  if (!admin) return <AdminLogin onLogin={setAdmin} />

  return (
    <div className="flex flex-col min-h-screen page-bg">
      {showChangePw && <ChangeAdminPassword onClose={() => setShowChangePw(false)} />}

      <header className="header-bg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            <div>
              <p className="font-bold text-white leading-tight text-sm">Panel de Directivos</p>
              <p className="text-xs text-slate-400">{admin.name ?? admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowChangePw(true)}
              className="text-slate-400 hover:text-white" title="Cambiar contraseña">
              <KeyRound size={18} />
            </button>
            <button
              onClick={async () => { await StorageService.adminLogout(); setAdmin(null) }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="header-bg">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          {[
            { id: 'stats',    label: 'Estadísticas' },
            { id: 'teachers', label: 'Docentes'     },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === id ? 'border-primary-400 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {tab === 'stats' && (
          <StatsPanel
            courseStats={courseStats}
            ranking={ranking}
            alerts={alerts}
            evaluations={evaluations}
          />
        )}
        {tab === 'teachers' && <TeachersPanel />}
      </main>
    </div>
  )
}
