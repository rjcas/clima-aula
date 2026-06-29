import { useState } from 'react'
import { LogOut, ClipboardList, History, Eye, EyeOff } from 'lucide-react'
import { StorageService } from '../services/storage'
import TeacherForm from '../components/teacher/TeacherForm'
import TeacherHistory from '../components/teacher/TeacherHistory'

// ── Cambio de contraseña (primer login) ───────────────────────────────────────
function ChangePasswordForm({ teacher, onDone }) {
  const [pw1,     setPw1]     = useState('')
  const [pw2,     setPw2]     = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (pw1.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (pw1 !== pw2)    { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    const { error } = await StorageService.teacherChangePassword(teacher.id, pw1)
    if (error) { setError(error); setLoading(false); return }
    onDone()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900
                    flex flex-col items-center justify-center px-6 gap-6">
      <div className="text-center flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mb-2" />
        <h1 className="text-xl font-bold text-white">Bienvenido/a, {teacher.name}</h1>
        <p className="text-blue-200 text-sm mt-1">
          Es tu primer ingreso. Por favor elegí una contraseña personal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw1}
              onChange={e => setPw1(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3
                         text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Repetir contraseña
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            placeholder="Repetí la contraseña"
            className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3
                       text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm bg-red-900/30 rounded-xl px-4 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
          {loading ? 'Guardando...' : 'Guardar contraseña y entrar'}
        </button>
      </form>
    </div>
  )
}

// ── Login docente ─────────────────────────────────────────────────────────────
function TeacherLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { teacher, error } = await StorageService.teacherLogin(username, password)
    if (error) { setError(error); setLoading(false); return }
    onLogin(teacher)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900
                    flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-2" />
        <h1 className="text-xl font-bold text-white">Escuela Dr. Ángel Gutiérrez</h1>
        <p className="text-slate-400 text-sm mt-1">Clima del Aula — Docentes</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="tu.usuario"
            autoCapitalize="none"
            autoCorrect="off"
            className="rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3
                       text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3
                         text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-300 text-sm bg-red-900/30 rounded-xl px-4 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

// ── Página principal docente ──────────────────────────────────────────────────
export default function TeacherPage({ onSaved }) {
  const [teacher,   setTeacher]   = useState(null)
  const [tab,       setTab]       = useState('form')
  const [lastSaved, setLastSaved] = useState(null)

  // Primer login → cambio de contraseña
  if (teacher?.must_change_password) {
    return (
      <ChangePasswordForm
        teacher={teacher}
        onDone={() => setTeacher({ ...teacher, must_change_password: false })}
      />
    )
  }

  if (!teacher) return <TeacherLogin onLogin={setTeacher} />

  function handleSaved(evaluation) {
    onSaved(evaluation)
    setLastSaved(evaluation)
    setTab('history')
  }

  return (
    <div className="flex flex-col min-h-screen page-bg">
      <header className="header-bg sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            <div>
              <p className="font-semibold text-white leading-tight">{teacher.name}</p>
              <p className="text-xs text-slate-400 capitalize">{teacher.role}</p>
            </div>
          </div>
          <button
            onClick={() => setTeacher(null)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <div className="header-bg">
        <div className="max-w-lg mx-auto px-4 flex gap-1">
          {[
            { id: 'form',    label: 'Nueva evaluación', icon: ClipboardList },
            { id: 'history', label: 'Mis evaluaciones',  icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`
                flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'}
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {tab === 'form' && (
          <TeacherForm teacher={teacher} onSaved={handleSaved} />
        )}
        {tab === 'history' && (
          <>
            {lastSaved && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4
                              text-sm text-emerald-700 font-medium">
                ✅ Última evaluación guardada · {lastSaved.average} ⭐
              </div>
            )}
            <TeacherHistory teacherId={teacher.id} />
          </>
        )}
      </main>
    </div>
  )
}
