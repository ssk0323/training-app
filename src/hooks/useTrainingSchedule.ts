import { useState, useEffect } from 'react'
import { getTrainingMenuService } from '@/services/serviceConfig'
import { getCurrentDayOfWeek } from '@/utils/dateUtils'
import type { TrainingMenu, DayOfWeek } from '@/types'

export const useTrainingSchedule = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    getCurrentDayOfWeek()
  )
  const [schedule, setSchedule] = useState<TrainingMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async (day: DayOfWeek) => {
    try {
      setIsLoading(true)
      setError(null)
      const menuService = getTrainingMenuService()
      const allMenus = await menuService.getAll()
      const daySchedule = allMenus.filter(menu =>
        menu.scheduledDays.includes(day)
      )
      setSchedule(daySchedule)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule(selectedDay)
  }, [selectedDay])

  const handleDayChange = (day: DayOfWeek) => {
    setSelectedDay(day)
  }

  return {
    selectedDay,
    schedule,
    isLoading,
    error,
    onDayChange: handleDayChange,
  }
}
