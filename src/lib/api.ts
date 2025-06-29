import type {
  TrainingMenu,
  TrainingRecord,
  CreateTrainingMenuInput,
  UpdateTrainingMenuInput,
  CreateTrainingRecordInput,
  ApiResponse,
} from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>(
      '/api/health'
    )
    return response
  }

  // Training Menu API
  async getMenus(): Promise<TrainingMenu[]> {
    const response =
      await this.request<ApiResponse<TrainingMenu[]>>('/api/menus')
    return response.data
  }

  async createMenu(input: CreateTrainingMenuInput): Promise<TrainingMenu> {
    const response = await this.request<ApiResponse<TrainingMenu>>(
      '/api/menus',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    )
    return response.data
  }

  async getMenu(id: string): Promise<TrainingMenu> {
    const response = await this.request<ApiResponse<TrainingMenu>>(
      `/api/menus/${id}`
    )
    return response.data
  }

  async updateMenu(
    id: string,
    input: UpdateTrainingMenuInput
  ): Promise<TrainingMenu> {
    const response = await this.request<ApiResponse<TrainingMenu>>(
      `/api/menus/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      }
    )
    return response.data
  }

  // Training Record API
  async getRecords(menuId?: string): Promise<TrainingRecord[]> {
    const params = menuId ? `?menuId=${menuId}` : ''
    const response = await this.request<ApiResponse<TrainingRecord[]>>(
      `/api/records${params}`
    )
    return response.data
  }

  async createRecord(
    input: CreateTrainingRecordInput
  ): Promise<TrainingRecord> {
    const response = await this.request<ApiResponse<TrainingRecord>>(
      '/api/records',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    )
    return response.data
  }

  async getLatestRecord(menuId: string): Promise<TrainingRecord | null> {
    const response = await this.request<ApiResponse<TrainingRecord | null>>(
      `/api/records/latest/${menuId}`
    )
    return response.data
  }

  // Schedule API
  async getTodaysSchedule(): Promise<TrainingMenu[]> {
    const response = await this.request<ApiResponse<TrainingMenu[]>>(
      '/api/schedule/today'
    )
    return response.data
  }
}

export const apiClient = new ApiClient()
