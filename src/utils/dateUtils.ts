import type { DayOfWeek } from '@/types'

export const getCurrentDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    'sunday',
    'monday', 
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  
  const today = new Date()
  return days[today.getDay()]
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}