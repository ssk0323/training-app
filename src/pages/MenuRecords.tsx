import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Layout } from '@/components/common/Layout'
import {
  getTrainingMenuService,
  getTrainingRecordService,
} from '@/services/serviceConfig'
import type { TrainingMenu, TrainingRecord } from '@/types'

export const MenuRecords = () => {
  const { menuId } = useParams<{ menuId: string }>()
  const [menu, setMenu] = useState<TrainingMenu | null>(null)
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (menuId) {
      loadData()
    }
  }, [menuId])

  const loadData = async () => {
    if (!menuId) return

    try {
      setIsLoading(true)
      setError(null)

      const menuService = getTrainingMenuService()
      const recordService = getTrainingRecordService()

      // Load menu and records in parallel
      const [menuData, recordsData] = await Promise.all([
        menuService.getById(menuId),
        recordService.getByMenuId(menuId),
      ])

      if (!menuData) {
        throw new Error('メニューが見つかりません')
      }

      setMenu(menuData)
      setRecords(recordsData)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'データの読み込みに失敗しました'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const calculateTotalVolume = (sets: TrainingRecord['sets']) => {
    return sets.reduce((total, set) => total + set.weight * set.reps, 0)
  }

  const getMaxWeight = (sets: TrainingRecord['sets']) => {
    return Math.max(...sets.map(set => set.weight))
  }

  if (isLoading) {
    return (
      <Layout title="読み込み中..." showBackButton>
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

  if (!menu) {
    return (
      <Layout title="エラー" showBackButton>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">メニューが見つかりません</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={menu.name} subtitle="記録一覧" showBackButton>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{menu.name}</h2>
            {menu.description && (
              <p className="text-gray-600 mt-1">{menu.description}</p>
            )}
          </div>
          <Link to={`/training/${menu.id}`}>
            <Button variant="primary">🏋️ 新しい記録</Button>
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">まだ記録がありません</div>
            <Link to={`/training/${menu.id}`}>
              <Button variant="primary">最初の記録を作成</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(record.date)}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        📊 総ボリューム: {calculateTotalVolume(record.sets)}kg
                      </span>
                      <span>🏋️ 最大重量: {getMaxWeight(record.sets)}kg</span>
                      <span>🔄 セット数: {record.sets.length}</span>
                    </div>
                  </div>
                  <Link to={`/training/${menu.id}`}>
                    <Button variant="secondary" size="sm">
                      📝 記録をコピー
                    </Button>
                  </Link>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    セット詳細:
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {record.sets.map((set, index) => (
                      <div key={set.id} className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-900">
                          セット {index + 1}
                        </div>
                        <div className="text-sm text-gray-600">
                          {set.weight}kg × {set.reps}回
                          {set.duration && ` (${set.duration}秒)`}
                          {set.restTime && ` 休憩: ${set.restTime}秒`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {record.comment && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      コメント:
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {record.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
