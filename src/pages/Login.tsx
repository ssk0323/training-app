import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Layout } from '@/components/common/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const demoAccounts = authService.getDemoAccounts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <Layout title="ログイン">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              アカウントにログイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              または{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                新規登録
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />

              <Input
                label="パスワード"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="パスワード"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            <div>
              <Button type="submit" isLoading={isLoading} className="w-full">
                ログイン
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                デモアカウント: demo@example.com / password
              </p>
            </div>
          </form>

          {/* デモアカウントセクション */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  デモアカウント
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500 text-center">
                以下のアカウントでログインできます（デバイス間で共有可能）
              </p>
              {demoAccounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleDemoLogin(account.email, account.password)
                    }
                    className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    使用
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
