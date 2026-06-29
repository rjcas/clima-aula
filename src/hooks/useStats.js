import { useMemo } from 'react'

function avg(numbers) {
  if (!numbers.length) return 0
  return +(numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)
}

function isSamePeriod(dateA, dateB, period) {
  const a = new Date(dateA)
  const b = new Date(dateB)
  if (period === 'day') return a.toDateString() === b.toDateString()
  if (period === 'week') {
    const startOfWeek = d => {
      const copy = new Date(d)
      copy.setDate(d.getDate() - d.getDay())
      copy.setHours(0,0,0,0)
      return copy.getTime()
    }
    return startOfWeek(a) === startOfWeek(b)
  }
  if (period === 'month') {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  }
  return false
}

export function useStats(evaluations, courses) {
  // ── Promedios por curso ──────────────────────────────────────────────────────
  const courseStats = useMemo(() => {
    if (!courses?.length) return []
    const now = new Date()

    return courses.map(course => {
      const courseEvals = evaluations.filter(e => e.courseId === course.id)

      const periodAvg = (period) => {
        const filtered = courseEvals.filter(e => isSamePeriod(e.timestamp, now, period))
        return avg(filtered.map(e => e.average))
      }

      const dimensionAvg = (dimId) => avg(courseEvals.map(e => e.dimensions[dimId] ?? 0))

      const prevMonth = new Date(now)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      const prevMonthEvals = courseEvals.filter(e => isSamePeriod(e.timestamp, prevMonth, 'month'))
      const prevMonthAvg   = avg(prevMonthEvals.map(e => e.average))
      const currentMonthAvg = periodAvg('month')
      const improvement = prevMonthAvg > 0 ? +(currentMonthAvg - prevMonthAvg).toFixed(2) : 0

      return {
        ...course,
        totalEvals:   courseEvals.length,
        avgDay:       periodAvg('day'),
        avgWeek:      periodAvg('week'),
        avgMonth:     currentMonthAvg,
        avgPrevMonth: prevMonthAvg,
        improvement,
        avgAll:       avg(courseEvals.map(e => e.average)),
        dimensions: {
          clima:         dimensionAvg('clima'),
          espacio:       dimensionAvg('espacio'),
          participacion: dimensionAvg('participacion'),
          convivencia:   dimensionAvg('convivencia'),
        },
      }
    })
  }, [evaluations, courses])

  // ── Ranking ──────────────────────────────────────────────────────────────────
  const ranking = useMemo(() => {
    return [...courseStats]
      .filter(c => c.totalEvals > 0)
      .sort((a, b) => b.avgMonth - a.avgMonth)
      .map((c, i) => ({ ...c, rank: i + 1 }))
  }, [courseStats])

  // ── Reconocimientos del mes ──────────────────────────────────────────────────
  const honors = useMemo(() => {
    const withData   = ranking.filter(c => c.avgMonth > 0)
    const bestAvg    = withData[0] ?? null
    const bestImprovement = [...courseStats]
      .filter(c => c.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)[0] ?? null
    return { bestAvg, bestImprovement }
  }, [ranking, courseStats])

  // ── Alertas ──────────────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    return courseStats
      .filter(c => c.avgPrevMonth > 0 && c.improvement < -1)
      .sort((a, b) => a.improvement - b.improvement)
  }, [courseStats])

  // ── Historial por curso ───────────────────────────────────────────────────────
  const getCourseHistory = (courseId) => {
    const evals = evaluations
      .filter(e => e.courseId === courseId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const byDay = {}
    evals.forEach(e => {
      const key = new Date(e.timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      if (!byDay[key]) byDay[key] = []
      byDay[key].push(e.average)
    })

    return Object.entries(byDay).map(([date, avgs]) => ({
      date,
      promedio: avg(avgs),
    }))
  }

  return { courseStats, ranking, honors, alerts, getCourseHistory }
}
