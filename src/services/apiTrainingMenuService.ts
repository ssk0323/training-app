import type {
  TrainingMenu,
  CreateTrainingMenuInput,
  UpdateTrainingMenuInput,
} from '@/types'
import { authService } from './authService'

// APIベースURL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://training-app.kenzo-sasaki-02.workers.dev'

class ApiTrainingMenuService {
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

    const response = await fetch(`${API_BASE_URL}/api/menus${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'APIリクエストに失敗しました')
    }

    return data
  }

  async create(input: CreateTrainingMenuInput): Promise<TrainingMenu> {
    try {
      const response = await this.apiRequest<TrainingMenu>('', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'メニューの作成に失敗しました'
      )
    }
  }

  async update(
    id: string,
    input: UpdateTrainingMenuInput
  ): Promise<TrainingMenu> {
    try {
      const response = await this.apiRequest<TrainingMenu>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'メニューの更新に失敗しました'
      )
    }
  }

  async getAll(): Promise<TrainingMenu[]> {
    try {
      const response = await this.apiRequest<TrainingMenu[]>('')
      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'メニューの取得に失敗しました'
      )
    }
  }

  async getById(id: string): Promise<TrainingMenu | null> {
    try {
      const response = await this.apiRequest<TrainingMenu>(`/${id}`)
      return response
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw new Error(
        error instanceof Error ? error.message : 'メニューの取得に失敗しました'
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
        error instanceof Error ? error.message : 'メニューの削除に失敗しました'
      )
    }
  }
}

export const apiTrainingMenuService = new ApiTrainingMenuService()
