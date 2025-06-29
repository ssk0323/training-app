import { authService } from '@/services/authService'

// APIリクエストの基本設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 認証ヘッダー付きのfetch関数
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const authHeaders = authService.getAuthHeaders()

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)

  // 401エラーの場合、トークンを更新して再試行
  if (response.status === 401) {
    const newToken = await authService.refreshToken()
    if (newToken) {
      const retryHeaders = authService.getAuthHeaders()
      const retryConfig: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...retryHeaders,
          ...options.headers,
        },
      }

      const retryResponse = await fetch(`${API_BASE_URL}${url}`, retryConfig)
      return retryResponse
    } else {
      // トークン更新に失敗した場合、ログアウト
      authService.logout()
      window.location.href = '/login'
      throw new Error('認証に失敗しました')
    }
  }

  return response
}

// GETリクエスト
export const apiGet = async (url: string): Promise<Response> => {
  return authenticatedFetch(url, { method: 'GET' })
}

// POSTリクエスト
export const apiPost = async (url: string, data?: any): Promise<Response> => {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUTリクエスト
export const apiPut = async (url: string, data?: any): Promise<Response> => {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETEリクエスト
export const apiDelete = async (url: string): Promise<Response> => {
  return authenticatedFetch(url, { method: 'DELETE' })
}

// レスポンスのJSON解析
export const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}
