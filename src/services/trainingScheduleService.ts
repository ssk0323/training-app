import type { TrainingMenu, DayOfWeek } from '@/types'
import { trainingMenuService } from './trainingMenuService'
import { getCurrentDayOfWeek } from '@/utils/dateUtils'

class TrainingScheduleService {
  async getTodaysSchedule(): Promise<TrainingMenu[]> {
    const today = getCurrentDayOfWeek()
    return this.getScheduleByDay(today)
  }

  async getScheduleByDay(day: DayOfWeek): Promise<TrainingMenu[]> {
    const allMenus = await trainingMenuService.getAll()
    
    return allMenus.filter(menu => 
      menu.scheduledDays.includes(day)
    )
  }
}

export const trainingScheduleService = new TrainingScheduleService()