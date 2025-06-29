import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Layout } from '@/components/common/Layout'
import { useAuth } from '@/contexts/AuthContext'

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // メールアドレス
    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    // 名前
    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '名前は2文字以上で入力してください'
    }

    // パスワード
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です'
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'パスワードには大文字が含まれる必要があります'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'パスワードには小文字が含まれる必要があります'
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'パスワードには数字が含まれる必要があります'
    }

    // パスワード確認
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認は必須です'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
      navigate('/')
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: '登録に失敗しました' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Layout title="新規登録">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              新規アカウント作成
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              または{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                既存のアカウントでログイン
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{errors.general}</div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="お名前"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="山田太郎"
                required
              />

              <Input
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="example@email.com"
                required
              />

              <Input
                label="パスワード"
                type="password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                error={errors.password}
                placeholder="8文字以上、大文字・小文字・数字を含む"
                required
              />

              <Input
                label="パスワード（確認）"
                type="password"
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                error={errors.confirmPassword}
                placeholder="パスワードを再入力"
                required
              />
            </div>

            <div>
              <Button type="submit" isLoading={isLoading} className="w-full">
                登録
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
