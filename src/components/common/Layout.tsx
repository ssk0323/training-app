import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'

interface LayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backTo?: string
}

export const Layout = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo = '/',
}: LayoutProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [showSessionExpired, setShowSessionExpired] = useState(false)

  useEffect(() => {
    // セッション監視
    const checkSession = () => {
      if (authService.isSessionExpired()) {
        setShowSessionExpired(true)
        logout()
        return
      }

      if (authService.shouldShowWarning()) {
        setShowSessionWarning(true)
      } else {
        setShowSessionWarning(false)
      }
    }

    // 初期チェック
    checkSession()

    // 定期的にチェック（1分ごと）
    const interval = setInterval(checkSession, 60000)

    // アクティビティ監視
    const handleActivity = () => {
      authService.updateActivity()
      setShowSessionWarning(false)
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      clearInterval(interval)
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [logout])

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const handleExtendSession = () => {
    authService.extendSession()
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    logout()
    setShowSessionWarning(false)
    setShowSessionExpired(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* セッション期限切れモーダル */}
      {showSessionExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              セッションが期限切れです
            </h3>
            <p className="text-gray-600 mb-6">
              セキュリティのため、長時間の操作がないためログアウトされました。
            </p>
            <Button onClick={handleLogout} className="w-full">
              ログイン画面に戻る
            </Button>
          </div>
        </div>
      )}

      {/* セッション警告バナー */}
      {showSessionWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span>セッションがまもなく期限切れになります</span>
            <div className="flex gap-2">
              <Button
                onClick={handleExtendSession}
                variant="secondary"
                size="sm"
              >
                セッション延長
              </Button>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button variant="secondary" onClick={handleBack}>
                  戻る
                </Button>
              )}

              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {user?.name}
                  </span>

                  <Button variant="secondary" onClick={handleLogout} size="sm">
                    ログアウト
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
