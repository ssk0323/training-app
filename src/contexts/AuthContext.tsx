import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import type { User, LoginInput, RegisterInput } from '@/types'
import { authService } from '@/services/authService'
import { trainingMenuService } from '@/services/trainingMenuService'
import { trainingRecordService } from '@/services/trainingRecordService'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  refreshToken: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初期化時に認証状態をチェック
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        // メニューサービスのユーザーを設定
        trainingMenuService.setCurrentUser(currentUser.id)
        trainingRecordService.setCurrentUser(currentUser.id)
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      authService.logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (input: LoginInput) => {
    try {
      const { user: loggedInUser } = await authService.login(input)
      setUser(loggedInUser)
      // メニューサービスのユーザーを設定
      trainingMenuService.setCurrentUser(loggedInUser.id)
      trainingRecordService.setCurrentUser(loggedInUser.id)
    } catch (error) {
      throw error
    }
  }

  const register = async (input: RegisterInput) => {
    try {
      const { user: registeredUser } = await authService.register(input)
      setUser(registeredUser)
      // メニューサービスのユーザーを設定
      trainingMenuService.setCurrentUser(registeredUser.id)
      trainingRecordService.setCurrentUser(registeredUser.id)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    // メニューサービスのユーザーをクリア
    trainingMenuService.clearUser()
    trainingRecordService.clearUser()
  }

  const refreshToken = async () => {
    const newToken = await authService.refreshToken()
    if (newToken) {
      // トークンが更新された場合、ユーザー情報も再取得
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
