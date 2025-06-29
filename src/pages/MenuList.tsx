import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Layout } from '@/components/common/Layout'
import { menuService } from '@/lib/serviceConfig'
import type { TrainingMenu } from '@/types'

export const MenuList = () => {
  const [menus, setMenus] = useState<TrainingMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const allMenus = await menuService.getAll()
      setMenus(allMenus)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'メニューの読み込みに失敗しました'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getDayLabels = (scheduledDays: string[]) => {
    const dayMap: Record<string, string> = {
      monday: '月',
      tuesday: '火',
      wednesday: '水',
      thursday: '木',
      friday: '金',
      saturday: '土',
      sunday: '日',
    }
    return scheduledDays.map(day => dayMap[day] || day).join('・')
  }

  if (isLoading) {
    return (
      <Layout title="メニュー一覧" showBackButton>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="エラー" showBackButton>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="メニュー一覧" showBackButton>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            トレーニングメニュー
          </h2>
          <Link to="/create-menu">
            <Button variant="primary">➕ 新規メニュー作成</Button>
          </Link>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              メニューがまだ作成されていません
            </div>
            <Link to="/create-menu">
              <Button variant="primary">最初のメニューを作成</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menus.map(menu => (
              <div
                key={menu.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {menu.name}
                  </h3>
                  <Link to={`/edit-menu/${menu.id}`}>
                    <Button variant="secondary" size="sm">
                      ✏️ 編集
                    </Button>
                  </Link>
                </div>

                {menu.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {menu.description}
                  </p>
                )}

                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    実施予定日
                  </span>
                  <p className="text-sm text-gray-700 mt-1">
                    {getDayLabels(menu.scheduledDays)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link to={`/training/${menu.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      🏋️ トレーニング記録
                    </Button>
                  </Link>
                  <Link to={`/menu-records/${menu.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      📊 記録一覧
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
