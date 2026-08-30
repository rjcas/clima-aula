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
      copy.setHours(0, 0, 0, 0)
      return copy.getTime()
    }
    return startOfWeek(a) === startOfWeek(b)
  }
  if (period === 'month') {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  }
  return false
}

function evalAvg(e) {
  const vals = Object.values(e.dimensions).filter(v => v !== null && v !== undefined && v > 0)
  return vals.length ? avg(vals) : 0
}

export function useStats(evaluations, courses) {
  const courseStats = useMemo(() => {
    if (!courses?.length) return []
    const now = new Date()

    return courses.map(course => {
      const courseEvals = evaluations.filter(e => e.courseId === course.id)

      const periodAvg = (period) => {
        const filtered = courseEvals.filter(e => isSamePeriod(e.timestamp, now, period))
        const avgs = filtered.map(evalAvg).filter(v => v > 0)
        return avg(avgs)
      }

      const dimensionAvg = (dimId) => {
        const vals = courseEvals
          .map(e => e.dimensions[dimId])
          .filter(v => v !== null && v !== undefined && v > 0)
        return avg(vals)
      }

      const prevMonth = new Date(now)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      const prevMonthAvgs = courseEvals
        .filter(e => isSamePeriod(e.timestamp, prevMonth, 'month'))
        .map(evalAvg).filter(v => v > 0)
      const prevMonthAvg    = avg(prevMonthAvgs)
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
        avgAll:       avg(courseEvals.map(evalAvg).filter(v => v > 0)),
        dimensions: {
          clima:         dimensionAvg('clima'),
          espacio:       dimensionAvg('espacio'),
          participacion: dimensionAvg('participacion'),
          convivencia:   dimensionAvg('convivencia'),
        },
      }
    })
  }, [evaluations, courses])

  const ranking = useMemo(() => {
    return [...courseStats]
      .filter(c => c.totalEvals > 0)
      .sort((a, b) => b.avgMonth - a.avgMonth)
      .map((c, i) => ({ ...c, rank: i + 1 }))
  }, [courseStats])

  const honors = useMemo(() => {
    const withData = ranking.filter(c => c.avgMonth > 0)
    const bestAvg  = withData[0] ?? null
    const bestImprovement = [...courseStats]
      .filter(c => c.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)[0] ?? null
    return { bestAvg, bestImprovement }
  }, [ranking, courseStats])

  const alerts = useMemo(() => {
    return courseStats
      .filter(c => c.avgPrevMonth > 0 && c.improvement < -1)
      .sort((a, b) => a.improvement - b.improvement)
  }, [courseStats])

  const getCourseHistory = (courseId) => {
    const evals = evaluations
      .filter(e => e.courseId === courseId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const byDay = {}
    evals.forEach(e => {
      const key = new Date(e.timestamp).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit',
      })
      if (!byDay[key]) byDay[key] = []
      const v = evalAvg(e)
      if (v > 0) byDay[key].push(v)
    })

    return Object.entries(byDay).map(([date, avgs]) => ({
      date,
      promedio: avg(avgs),
    }))
  }

  return { courseStats, ranking, honors, alerts, getCourseHistory }
}
