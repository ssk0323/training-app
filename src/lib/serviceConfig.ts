// Service configuration to switch between local and API services
import { trainingMenuService } from '@/services/trainingMenuService'
import { trainingRecordService } from '@/services/trainingRecordService'
import { trainingScheduleService } from '@/services/trainingScheduleService'
import { apiTrainingMenuService } from '@/services/apiTrainingMenuService'
import { apiTrainingRecordService } from '@/services/apiTrainingRecordService'
import { apiTrainingScheduleService } from '@/services/apiTrainingScheduleService'

const USE_API = import.meta.env.VITE_USE_API === 'true'

export const menuService = USE_API ? apiTrainingMenuService : trainingMenuService
export const recordService = USE_API ? apiTrainingRecordService : trainingRecordService
export const scheduleService = USE_API ? apiTrainingScheduleService : trainingScheduleService