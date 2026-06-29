import { useState, useEffect, useCallback } from 'react'
import { StorageService } from '../services/storage'

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState([])
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function init() {
      const [evalsData, coursesData] = await Promise.all([
        StorageService.getEvaluations(),
        StorageService.getCourses(),
      ])
      setEvaluations(evalsData)
      setCourses(coursesData)
      setLoading(false)
    }
    init()
  }, [])

  const addEvaluation = useCallback(async (evalData) => {
    const saved = await StorageService.saveEvaluation(evalData)
    setEvaluations(prev => [...prev, saved])
    return saved
  }, [])

  return { evaluations, courses, loading, addEvaluation }
}
