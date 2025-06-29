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

// デモアカウントの定義
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

  // ブラウザ環境チェック
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
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

  private getUsers(): UserCredentials[] {
    if (!this.isBrowser()) {
      return []
    }
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY)
    return usersStr ? JSON.parse(usersStr) : []
  }

  private saveUsers(users: UserCredentials[]): void {
    if (!this.isBrowser()) {
      return
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  // デモアカウントかどうかをチェック
  private isDemoAccount(
    email: string,
    password: string
  ): { isDemo: boolean; user?: User } {
    const demoAccount = DEMO_ACCOUNTS.find(
      account => account.email === email && account.password === password
    )

    if (demoAccount) {
      return {
        isDemo: true,
        user: {
          id: `demo-${demoAccount.email}`,
          email: demoAccount.email,
          name: demoAccount.name,
          createdAt: new Date().toISOString(),
        },
      }
    }

    return { isDemo: false }
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (!this.isBrowser()) {
      throw new Error('ブラウザ環境でのみ利用可能です')
    }

    // パスワード強度チェック
    const passwordValidation = this.validatePassword(input.password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error)
    }

    // 既存ユーザーチェック
    const existingUsers = this.getUsers()
    const existingUser = existingUsers.find(user => user.email === input.email)
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています')
    }

    // 動的インポートでbcryptjsを読み込み
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash(
      input.password,
      this.SALT_ROUNDS
    )

    // ユーザー作成
    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString(),
    }

    // ローカルストレージに保存
    const users = [...existingUsers, { ...user, passwordHash: hashedPassword }]
    this.saveUsers(users)

    // JWTトークン生成
    const token = await this.generateToken(user)

    return { user, token }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!this.isBrowser()) {
      throw new Error('ブラウザ環境でのみ利用可能です')
    }

    // レート制限チェック
    const rateLimitCheck = this.checkRateLimit(input.email)
    if (!rateLimitCheck.isAllowed) {
      throw new Error(rateLimitCheck.error)
    }

    // デモアカウントの処理
    const demoCheck = this.isDemoAccount(input.email, input.password)
    if (demoCheck.isDemo && demoCheck.user) {
      const token = await this.generateToken(demoCheck.user)
      return { user: demoCheck.user, token }
    }

    // ユーザー検索
    const users = this.getUsers()
    const userData = users.find(user => user.email === input.email)

    if (!userData) {
      this.recordLoginAttempt(input.email, false)
      throw new Error('メールアドレスまたはパスワードが正しくありません')
    }

    // 動的インポートでbcryptjsを読み込み
    const bcrypt = await import('bcryptjs')
    const isValidPassword = await bcrypt.default.compare(
      input.password,
      userData.passwordHash
    )
    if (!isValidPassword) {
      this.recordLoginAttempt(input.email, false)
      throw new Error('メールアドレスまたはパスワードが正しくありません')
    }

    // ログイン成功
    this.recordLoginAttempt(input.email, true)

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
    }

    // JWTトークン生成
    const token = await this.generateToken(user)

    return { user, token }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isBrowser()) {
      return null
    }

    const token = this.getStoredToken()
    if (!token) return null

    try {
      const payload = await this.verifyToken(token)
      const users = this.getUsers()
      const userData = users.find(user => user.id === payload.sub)

      if (!userData) {
        // デモアカウントの場合は直接返す
        const demoAccount = DEMO_ACCOUNTS.find(
          account => `demo-${account.email}` === payload.sub
        )
        if (demoAccount) {
          return {
            id: `demo-${demoAccount.email}`,
            email: demoAccount.email,
            name: demoAccount.name,
            createdAt: new Date().toISOString(),
          }
        }
        return null
      }

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

  logout(): void {
    if (!this.isBrowser()) {
      return
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('session_start')
    localStorage.removeItem('last_activity')
  }

  private async generateToken(user: User): Promise<string> {
    // 動的インポートでjoseを読み込み
    const jose = await import('jose')
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
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('session_start', Date.now().toString())
      localStorage.setItem('last_activity', Date.now().toString())
    }

    return token
  }

  private async verifyToken(token: string): Promise<any> {
    // 動的インポートでjoseを読み込み
    const jose = await import('jose')
    const secret = new TextEncoder().encode(this.JWT_SECRET)

    const { payload } = await jose.jwtVerify(token, secret)
    return payload
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

    const token = await this.generateToken(user)
    return token
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
