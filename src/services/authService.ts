import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types'

// APIベースURL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://training-app.kenzo-sasaki-02.workers.dev'

// デモアカウントの定義（フォールバック用）
const DEMO_ACCOUNTS = [
  { email: 'demo@example.com', password: 'DemoPass123', name: 'デモユーザー1' },
  {
    email: 'demo2@example.com',
    password: 'DemoPass123',
    name: 'デモユーザー2',
  },
  {
    email: 'demo3@example.com',
    password: 'DemoPass123',
    name: 'デモユーザー3',
  },
  {
    email: 'test@example.com',
    password: 'TestPass123',
    name: 'テストユーザー',
  },
]

class AuthService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30分
  private readonly WARNING_TIME = 5 * 60 * 1000 // 5分前

  // ブラウザ環境チェック
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  // APIリクエスト用のヘルパー関数
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getStoredToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'APIリクエストに失敗しました')
    }

    return data
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      const response = await this.apiRequest<AuthResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      if (response.success && response.token) {
        this.saveToken(response.token)
      }

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : '登録に失敗しました'
      )
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await this.apiRequest<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      if (response.success && response.token) {
        this.saveToken(response.token)
      }

      return response
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'ログインに失敗しました'
      )
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isBrowser()) {
      return null
    }

    const token = this.getStoredToken()
    if (!token) return null

    try {
      const response = await this.apiRequest<AuthResponse>('/me')

      if (response.success && response.user) {
        return response.user
      }

      return null
    } catch (error) {
      console.error('トークン検証エラー:', error)
      this.logout()
      return null
    }
  }

  logout(): void {
    if (!this.isBrowser()) {
      return
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('session_start')
    localStorage.removeItem('last_activity')
  }

  private saveToken(token: string): void {
    if (!this.isBrowser()) {
      return
    }
    localStorage.setItem('auth_token', token)
    localStorage.setItem('session_start', Date.now().toString())
    localStorage.setItem('last_activity', Date.now().toString())
  }

  private getStoredToken(): string | null {
    if (!this.isBrowser()) {
      return null
    }
    return localStorage.getItem('auth_token')
  }

  // セッション管理
  updateActivity(): void {
    if (!this.isBrowser()) {
      return
    }
    localStorage.setItem('last_activity', Date.now().toString())
  }

  isSessionExpired(): boolean {
    if (!this.isBrowser()) {
      return true
    }
    const lastActivity = localStorage.getItem('last_activity')
    if (!lastActivity) return true

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity > this.SESSION_TIMEOUT
  }

  shouldShowWarning(): boolean {
    if (!this.isBrowser()) {
      return false
    }
    const lastActivity = localStorage.getItem('last_activity')
    if (!lastActivity) return false

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity > this.SESSION_TIMEOUT - this.WARNING_TIME
  }

  extendSession(): void {
    this.updateActivity()
  }

  // 認証状態をチェック
  async isAuthenticated(): Promise<boolean> {
    if (!this.isBrowser()) {
      return false
    }
    const token = this.getStoredToken()
    return !!token && !this.isSessionExpired()
  }

  // トークンの更新
  async refreshToken(): Promise<string | null> {
    if (!this.isBrowser()) {
      return null
    }
    const user = await this.getCurrentUser()
    if (!user) return null

    // 新しいログインを実行してトークンを更新
    try {
      // デモアカウントの場合は特別処理
      if (user.id === 'demo-user-id') {
        const response = await this.login({
          email: 'demo@example.com',
          password: 'DemoPass123',
        })
        return response.token || null
      }

      // 実際のユーザーの場合は再ログインが必要
      // ここでは簡易的に現在のトークンを返す
      return this.getStoredToken()
    } catch (error) {
      console.error('トークン更新エラー:', error)
      return null
    }
  }

  // 認証ヘッダーを取得（APIリクエスト用）
  getAuthHeaders(): Record<string, string> {
    if (!this.isBrowser()) {
      return {}
    }
    const token = this.getStoredToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // デモアカウント一覧を取得
  getDemoAccounts(): Array<{ email: string; password: string; name: string }> {
    return DEMO_ACCOUNTS
  }
}

export const authService = new AuthService()
