import type {
  TrainingRecord,
  CreateTrainingRecordInput,
  UpdateTrainingRecordInput,
} from '@/types'
import { authService } from './authService'

// APIベースURL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://training-app.kenzo-sasaki-02.workers.dev'

class ApiTrainingRecordService {
  // APIリクエスト用のヘルパー関数
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    }

    const response = await fetch(`${API_BASE_URL}/api/records${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'APIリクエストに失敗しました')
    }

    return data
  }

  async create(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
    try {
      const response = await this.apiRequest<TrainingRecord>('', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '記録の作成に失敗しました'
      )
    }
  }

  async update(input: UpdateTrainingRecordInput): Promise<TrainingRecord> {
    try {
      const response = await this.apiRequest<TrainingRecord>(`/${input.id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '記録の更新に失敗しました'
      )
    }
  }

  async getAll(): Promise<TrainingRecord[]> {
    try {
      const response = await this.apiRequest<TrainingRecord[]>('')
      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '記録の取得に失敗しました'
      )
    }
  }

  async getById(id: string): Promise<TrainingRecord | null> {
    try {
      const response = await this.apiRequest<TrainingRecord>(`/${id}`)
      return response
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw new Error(
        error instanceof Error ? error.message : '記録の取得に失敗しました'
      )
    }
  }

  async getByMenuId(menuId: string): Promise<TrainingRecord[]> {
    try {
      const response = await this.apiRequest<TrainingRecord[]>(
        `/menu/${menuId}`
      )
      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '記録の取得に失敗しました'
      )
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiRequest(`/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '記録の削除に失敗しました'
      )
    }
  }
}

export const apiTrainingRecordService = new ApiTrainingRecordService()
