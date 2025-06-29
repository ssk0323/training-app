import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Layout } from '@/components/common/Layout'
import { useAuth } from '@/contexts/AuthContext'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await login({ email: email.trim(), password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
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
        </div>
      </div>
    </Layout>
  )
}
