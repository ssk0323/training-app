import { apiClient } from '@/lib/api'
import type { TrainingMenu, DayOfWeek } from '@/types'

class ApiTrainingScheduleService {
  async getTodaysSchedule(): Promise<TrainingMenu[]> {
    return apiClient.getTodaysSchedule()
  }

  async getScheduleByDay(day: DayOfWeek): Promise<TrainingMenu[]> {
    // For API version, we get all menus and filter client-side
    // In the future, this could be optimized with API parameters
    const allMenus = await apiClient.getMenus()
    
    return allMenus.filter(menu => 
      menu.scheduledDays.includes(day)
    )
  }
}

export const apiTrainingScheduleService = new ApiTrainingScheduleService()