import { useState } from 'react'
import { Users, BarChart2, BookOpen } from 'lucide-react'
import { useEvaluations } from './hooks/useEvaluations'
import { useStats } from './hooks/useStats'
import TeacherPage from './pages/TeacherPage'
import PublicPage from './pages/PublicPage'
import AdminPage from './pages/AdminPage'

const TABS = [
  { id: 'public',  label: 'Inicio',     icon: BookOpen  },
  { id: 'teacher', label: 'Docente',    icon: Users     },
  { id: 'admin',   label: 'Directivos', icon: BarChart2 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('public')
  const { evaluations, courses, loading, addEvaluation } = useEvaluations()
  const { ranking, honors, alerts, courseStats, getCourseHistory } = useStats(evaluations, courses)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-bounce">🏫</p>
          <p className="text-slate-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 ${activeTab === 'teacher' ? '' : 'pb-16'}`}>
        {activeTab === 'public' && (
          <PublicPage
            ranking={ranking}
            honors={honors}
            getCourseHistory={getCourseHistory}
          />
        )}
        {activeTab === 'teacher' && (
          <div className="pb-16">
            <TeacherPage onSaved={addEvaluation} />
          </div>
        )}
        {activeTab === 'admin' && (
          <AdminPage
            courseStats={courseStats}
            ranking={ranking}
            alerts={alerts}
            evaluations={evaluations}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 header-bg">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors
                ${activeTab === id ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
