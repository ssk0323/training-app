import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Layout } from '@/components/common/Layout'
import { analyticsService } from '@/services/analyticsService'
import {
  getTrainingRecordService,
  getTrainingMenuService,
} from '@/services/serviceConfig'
import type {
  WeeklyFrequency,
  MonthlyFrequency,
  ProgressData,
  MuscleGroupStats,
} from '@/services/analyticsService'
import type { TrainingMenu } from '@/types'

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
]

export const Analytics = () => {
  const [activeTab, setActiveTab] = useState<
    'frequency' | 'progress' | 'muscle'
  >('frequency')
  const [frequencyType, setFrequencyType] = useState<'weekly' | 'monthly'>(
    'weekly'
  )
  const [selectedMenuId, setSelectedMenuId] = useState<string>('')
  const [timeRange, setTimeRange] = useState<number>(90) // days

  // Data states
  const [frequencyData, setFrequencyData] = useState<
    WeeklyFrequency[] | MonthlyFrequency[]
  >([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [muscleGroupData, setMuscleGroupData] = useState<MuscleGroupStats[]>([])
  const [menus, setMenus] = useState<TrainingMenu[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load menus on component mount
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const menuService = getTrainingMenuService()
        const allMenus = await menuService.getAll()
        setMenus(allMenus)
        if (allMenus.length > 0 && !selectedMenuId) {
          setSelectedMenuId(allMenus[0].id)
        }
      } catch (err) {
        console.error('Failed to load menus:', err)
        setError('メニューの読み込みに失敗しました')
      }
    }
    loadMenus()
  }, [selectedMenuId])

  // Load data based on active tab
  useEffect(() => {
    loadData()
  }, [activeTab, frequencyType, selectedMenuId, timeRange])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const recordService = getTrainingRecordService()
      const menuService = getTrainingMenuService()

      const records = await recordService.getAll()
      const recentRecords = analyticsService.filterRecentRecords(
        records,
        timeRange
      )

      switch (activeTab) {
        case 'frequency':
          if (frequencyType === 'monthly') {
            setFrequencyData(
              analyticsService.calculateMonthlyFrequency(recentRecords)
            )
          } else {
            setFrequencyData(
              analyticsService.calculateWeeklyFrequency(recentRecords)
            )
          }
          break

        case 'progress':
          if (selectedMenuId) {
            const menuRecords = await recordService.getByMenuId(selectedMenuId)
            const recentMenuRecords = analyticsService.filterRecentRecords(
              menuRecords,
              timeRange
            )
            setProgressData(
              analyticsService.calculateProgress(recentMenuRecords)
            )
          }
          break

        case 'muscle':
          const allMenus = await menuService.getAll()
          setMuscleGroupData(
            analyticsService.calculateMuscleGroupStats(recentRecords, allMenus)
          )
          break
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err)
      setError('データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFrequencyData = (
    data: WeeklyFrequency[] | MonthlyFrequency[]
  ) => {
    return data.map(item => ({
      ...item,
      period: 'week' in item ? item.week : item.month,
      label:
        'week' in item
          ? new Date(item.week).toLocaleDateString('ja-JP', {
              month: 'short',
              day: 'numeric',
            })
          : new Date(item.month + '-01').toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'short',
            }),
    }))
  }

  const formatProgressData = (data: ProgressData[]) => {
    return data.map(item => ({
      ...item,
      label: new Date(item.date).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      volume: Math.round(item.volume),
    }))
  }

  if (isLoading) {
    return (
      <Layout title="統計・分析" showBackButton>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="統計・分析" showBackButton>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'frequency', label: 'トレーニング頻度' },
                { key: 'progress', label: '進捗チャート' },
                { key: 'muscle', label: '筋肉部位別統計' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間
              </label>
              <select
                value={timeRange}
                onChange={e => setTimeRange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={30}>過去30日</option>
                <option value={90}>過去90日</option>
                <option value={180}>過去180日</option>
                <option value={365}>過去1年</option>
              </select>
            </div>

            {/* Frequency Type (only for frequency tab) */}
            {activeTab === 'frequency' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示単位
                </label>
                <select
                  value={frequencyType}
                  onChange={e =>
                    setFrequencyType(e.target.value as 'weekly' | 'monthly')
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="weekly">週間</option>
                  <option value="monthly">月間</option>
                </select>
              </div>
            )}

            {/* Menu Selection (only for progress tab) */}
            {activeTab === 'progress' && menus.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メニュー
                </label>
                <select
                  value={selectedMenuId}
                  onChange={e => setSelectedMenuId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Chart Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === 'frequency' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {frequencyType === 'weekly' ? '週間' : '月間'}トレーニング頻度
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatFrequencyData(frequencyData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip
                    formatter={value => [`${value}回`, 'トレーニング回数']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                進捗チャート - {menus.find(m => m.id === selectedMenuId)?.name}
              </h3>
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={formatProgressData(progressData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="weight" orientation="left" />
                    <YAxis yAxisId="volume" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="weight"
                      type="monotone"
                      dataKey="maxWeight"
                      stroke="#ef4444"
                      name="最大重量 (kg)"
                    />
                    <Line
                      yAxisId="volume"
                      type="monotone"
                      dataKey="volume"
                      stroke="#10b981"
                      name="ボリューム (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  選択したメニューのデータがありません
                </div>
              )}
            </div>
          )}

          {activeTab === 'muscle' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">筋肉部位別統計</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <h4 className="text-md font-medium mb-2">セッション数</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={muscleGroupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) =>
                          `${entry.muscleGroup} ${entry.percent ? (entry.percent * 100).toFixed(0) : 0}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalSessions"
                      >
                        {muscleGroupData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.muscleGroup}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Table */}
                <div>
                  <h4 className="text-md font-medium mb-2">詳細統計</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            部位
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            セッション
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            平均重量
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {muscleGroupData.map(stat => (
                          <tr key={stat.muscleGroup}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {stat.muscleGroup}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {stat.totalSessions}回
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {stat.averageWeight.toFixed(1)}kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
