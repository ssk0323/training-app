import { useState, useEffect } from 'react'
import { MemoAnalyticsService } from '@/services/memoAnalyticsService'
import { getTrainingRecordService } from '@/services/serviceConfig'
import type { TrainingRecord } from '@/types'

interface MemoStatisticsProps {
  menuId?: string
  isVisible: boolean
  onClose: () => void
}

export const MemoStatistics = ({
  menuId,
  isVisible,
  onClose,
}: MemoStatisticsProps) => {
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRecords = async () => {
      if (isVisible && menuId) {
        setLoading(true)
        try {
          const recordService = getTrainingRecordService()
          const allRecords = await recordService.getByMenuId(menuId)
          setRecords(allRecords)
        } catch (error) {
          console.error('レコード読み込みエラー:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadRecords()
  }, [isVisible, menuId])

  if (!isVisible) return null

  const statistics = MemoAnalyticsService.getMemoStatistics(records)
  const moodTrends = MemoAnalyticsService.analyzeMoodTrends(records)
  const frequentWords = MemoAnalyticsService.extractFrequentWords(records)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              📊 メモ分析レポート
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">分析中...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 基本統計 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">📈 基本統計</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.totalMemos}
                    </div>
                    <div className="text-sm text-blue-700">総メモ数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.memoFrequency}%
                    </div>
                    <div className="text-sm text-blue-700">記録率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.averageLength}
                    </div>
                    <div className="text-sm text-blue-700">平均文字数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {records.length}
                    </div>
                    <div className="text-sm text-blue-700">総記録数</div>
                  </div>
                </div>
              </div>

              {/* よく使う単語 */}
              {frequentWords.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-3">
                    🔤 よく使う言葉
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {frequentWords.map((word, index) => (
                      <span
                        key={index}
                        className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 感情トレンド */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-3">
                  😊 感情・状態の傾向
                </h3>
                <div className="space-y-3">
                  {moodTrends.positive.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-green-700 mb-1">
                        ポジティブ
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {moodTrends.positive.map((word, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {moodTrends.negative.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-red-700 mb-1">
                        要注意
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {moodTrends.negative.map((word, index) => (
                          <span
                            key={index}
                            className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {moodTrends.neutral.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        標準
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {moodTrends.neutral.map((word, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 改善提案 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-3">
                  💡 改善提案
                </h3>
                <div className="space-y-2 text-sm text-purple-800">
                  {statistics.memoFrequency < 50 && (
                    <div>
                      • メモの記録率が{statistics.memoFrequency}
                      %です。もう少し詳しく記録してみましょう
                    </div>
                  )}
                  {statistics.averageLength < 20 && (
                    <div>
                      • 平均{statistics.averageLength}
                      文字と短めです。感じたことをもう少し詳しく書いてみては？
                    </div>
                  )}
                  {moodTrends.negative.length > moodTrends.positive.length && (
                    <div>
                      • 疲労感に関する記録が多めです。休息も大切にしましょう
                    </div>
                  )}
                  {statistics.memoFrequency >= 80 &&
                    statistics.averageLength >= 30 && (
                      <div>
                        • 素晴らしい記録習慣です！継続していきましょう 🎉
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
