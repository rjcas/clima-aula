import { useState } from 'react'
import { Trophy, BarChart2 } from 'lucide-react'
import RankingTable from '../components/public/RankingTable'
import HonorBoard from '../components/public/HonorBoard'
import CourseDetail from '../components/public/CourseDetail'
import SchoolHeader from '../components/ui/SchoolHeader'

export default function PublicPage({ ranking, honors, getCourseHistory }) {
  const [tab, setTab] = useState('ranking')
  const [selectedCourse, setSelectedCourse] = useState(null)

  function handleSelectCourse(courseId) {
    setSelectedCourse(ranking.find(c => c.id === courseId))
  }

  const tabs = [
    { id: 'ranking', label: 'Ranking',        icon: BarChart2 },
    { id: 'honors',  label: 'Reconocimientos', icon: Trophy    },
  ]

  return (
    <div className="flex flex-col min-h-screen page-bg">
      {/* Header */}
      <header className="header-bg sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <SchoolHeader subtitle="Clima del Aula" dark />
        </div>
      </header>

      {selectedCourse ? (
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
          <CourseDetail
            course={selectedCourse}
            history={getCourseHistory(selectedCourse.id)}
            onBack={() => setSelectedCourse(null)}
          />
        </main>
      ) : (
        <>
          {/* Tabs */}
          <div className="header-bg">
            <div className="max-w-lg mx-auto px-4 flex gap-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors
                    ${tab === id
                      ? 'border-primary-400 text-primary-400'
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
            {tab === 'ranking' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Promedio del mes</h2>
                  <span className="text-xs text-slate-400">Tocá un curso para ver su ficha</span>
                </div>
                <RankingTable ranking={ranking} onSelectCourse={handleSelectCourse} />
              </>
            )}
            {tab === 'honors' && (
              <>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">Cuadro de honor</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Reconocimientos del mes en curso</p>
                </div>
                <HonorBoard honors={honors} />
              </>
            )}
          </main>
        </>
      )}
    </div>
  )
}
