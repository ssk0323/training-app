import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types'

// ローカルストレージでユーザーを管理（実際のプロジェクトではデータベースを使用）
const USERS_STORAGE_KEY = 'auth_users'

interface UserCredentials {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

class AuthService {
  private readonly JWT_SECRET =
    import.meta.env.VITE_JWT_SECRET || 'fallback-secret-key'
  private readonly SALT_ROUNDS = 12
  private readonly TOKEN_EXPIRY = '7d'
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30分
  private readonly WARNING_TIME = 5 * 60 * 1000 // 5分前

  // レート制限用のカウンター
  private loginAttempts = new Map<
    string,
    { count: number; lastAttempt: number }
  >()
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15分

  private getUsers(): UserCredentials[] {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY)
    return usersStr ? JSON.parse(usersStr) : []
  }

  private saveUsers(users: UserCredentials[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  // パスワード強度チェック
  private validatePassword(password: string): {
    isValid: boolean
    error?: string
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'パスワードは8文字以上である必要があります',
      }
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'パスワードには大文字が含まれる必要があります',
      }
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'パスワードには小文字が含まれる必要があります',
      }
    }

    if (!/\d/.test(password)) {
      return {
        isValid: false,
        error: 'パスワードには数字が含まれる必要があります',
      }
    }

    return { isValid: true }
  }

  // レート制限チェック
  private checkRateLimit(email: string): {
    isAllowed: boolean
    error?: string
  } {
    const now = Date.now()
    const attempts = this.loginAttempts.get(email)

    if (!attempts) {
      return { isAllowed: true }
    }

    // ロックアウト期間を過ぎている場合はリセット
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email)
      return { isAllowed: true }
    }

    // 最大試行回数を超えている場合
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const remainingTime = Math.ceil(
        (this.LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60
      )
      return {
        isAllowed: false,
        error: `ログイン試行回数が上限に達しました。${remainingTime}分後に再試行してください。`,
      }
    }

    return { isAllowed: true }
  }

  // レート制限を記録
  private recordLoginAttempt(email: string, success: boolean) {
    const now = Date.now()
    const attempts = this.loginAttempts.get(email) || {
      count: 0,
      lastAttempt: 0,
    }

    if (success) {
      // 成功した場合はリセット
      this.loginAttempts.delete(email)
    } else {
      // 失敗した場合はカウントアップ
      attempts.count += 1
      attempts.lastAttempt = now
      this.loginAttempts.set(email, attempts)
    }
  }

  // ユーザー登録
  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    // パスワード強度チェック
    const passwordValidation = this.validatePassword(input.password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error)
    }

    const users = this.getUsers()

    // 既存ユーザーのチェック
    const existingUser = users.find(u => u.email === input.email)
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています')
    }

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS)

    // 新しいユーザーを作成
    const newUser: UserCredentials = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash,
      createdAt: new Date().toISOString(),
    }

    // ユーザーを保存
    const updatedUsers = [...users, newUser]
    this.saveUsers(updatedUsers)

    // JWTトークンを生成
    const token = await this.generateToken(newUser)

    // ローカルストレージに保存
    localStorage.setItem('auth_token', token)
    localStorage.setItem('session_start', Date.now().toString())
    localStorage.setItem('last_activity', Date.now().toString())

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
      },
      token,
    }
  }

  // ユーザーログイン
  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    // レート制限チェック
    const rateLimitCheck = this.checkRateLimit(input.email)
    if (!rateLimitCheck.isAllowed) {
      throw new Error(rateLimitCheck.error)
    }

    const users = this.getUsers()

    // デモアカウントのチェック
    if (input.email === 'demo@example.com' && input.password === 'password') {
      const demoUser: User = {
        id: 'demo-1',
        email: input.email,
        name: 'デモユーザー',
        createdAt: new Date().toISOString(),
      }

      const token = await this.generateToken(demoUser)

      localStorage.setItem('auth_token', token)
      localStorage.setItem('session_start', Date.now().toString())
      localStorage.setItem('last_activity', Date.now().toString())

      return { user: demoUser, token }
    }

    // 登録済みユーザーのチェック
    const user = users.find(u => u.email === input.email)
    if (!user) {
      this.recordLoginAttempt(input.email, false)
      throw new Error('メールアドレスまたはパスワードが正しくありません')
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(
      input.password,
      user.passwordHash
    )
    if (!isValidPassword) {
      this.recordLoginAttempt(input.email, false)
      throw new Error('メールアドレスまたはパスワードが正しくありません')
    }

    // ログイン成功
    this.recordLoginAttempt(input.email, true)

    // JWTトークンを生成
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })

    // ローカルストレージに保存
    localStorage.setItem('auth_token', token)
    localStorage.setItem('session_start', Date.now().toString())
    localStorage.setItem('last_activity', Date.now().toString())

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    }
  }

  // ログアウト
  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('session_start')
    localStorage.removeItem('last_activity')
  }

  // 現在のユーザーを取得
  async getCurrentUser(): Promise<User | null> {
    const token = this.getStoredToken()
    if (!token) return null

    try {
      const payload = await this.verifyToken(token)
      const users = this.getUsers()
      const userData = users.find(user => user.id === payload.sub)

      if (!userData) return null

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
      }
    } catch (error) {
      console.error('トークン検証エラー:', error)
      this.logout()
      return null
    }
  }

  // 認証状態をチェック
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('auth_token')
    return !!token && !this.isSessionExpired()
  }

  // トークンの更新
  async refreshToken(): Promise<string | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    const token = await this.generateToken(user)

    localStorage.setItem('auth_token', token)
    localStorage.setItem('session_start', Date.now().toString())
    localStorage.setItem('last_activity', Date.now().toString())
    return token
  }

  // 認証ヘッダーを取得（APIリクエスト用）
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async generateToken(user: User): Promise<string> {
    const secret = new TextEncoder().encode(this.JWT_SECRET)

    const token = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.TOKEN_EXPIRY)
      .sign(secret)

    // トークンを保存
    localStorage.setItem('auth_token', token)
    localStorage.setItem('session_start', Date.now().toString())
    localStorage.setItem('last_activity', Date.now().toString())

    return token
  }

  private async verifyToken(token: string): Promise<any> {
    const secret = new TextEncoder().encode(this.JWT_SECRET)

    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  // セッション管理
  updateActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString())
  }

  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem('last_activity')
    if (!lastActivity) return true

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity > this.SESSION_TIMEOUT
  }

  shouldShowWarning(): boolean {
    const lastActivity = localStorage.getItem('last_activity')
    if (!lastActivity) return false

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity > this.SESSION_TIMEOUT - this.WARNING_TIME
  }

  extendSession(): void {
    this.updateActivity()
  }
}

export const authService = new AuthService()
