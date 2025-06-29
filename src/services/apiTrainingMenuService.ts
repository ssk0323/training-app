import { apiClient } from '@/lib/api'
import type { TrainingMenu, CreateTrainingMenuInput } from '@/types'

class ApiTrainingMenuService {
  async create(input: CreateTrainingMenuInput): Promise<TrainingMenu> {
    return apiClient.createMenu(input)
  }

  async getAll(): Promise<TrainingMenu[]> {
    return apiClient.getMenus()
  }

  async getById(id: string): Promise<TrainingMenu | null> {
    try {
      return await apiClient.getMenu(id)
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }
}

export const apiTrainingMenuService = new ApiTrainingMenuService()