import { apiClient } from '@/lib/api'
import type { TrainingRecord, CreateTrainingRecordInput } from '@/types'

class ApiTrainingRecordService {
  async create(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
    return apiClient.createRecord(input)
  }

  async getByMenuId(menuId: string): Promise<TrainingRecord[]> {
    return apiClient.getRecords(menuId)
  }

  async getLatestByMenuId(menuId: string): Promise<TrainingRecord | null> {
    return apiClient.getLatestRecord(menuId)
  }

  async getAll(): Promise<TrainingRecord[]> {
    return apiClient.getRecords()
  }

  // Note: Update and delete not implemented in API yet
  async update(): Promise<TrainingRecord> {
    throw new Error('Update not implemented via API yet')
  }

  async delete(): Promise<void> {
    throw new Error('Delete not implemented via API yet')
  }
}

export const apiTrainingRecordService = new ApiTrainingRecordService()