import { useTrainingSchedule } from '@/hooks/useTrainingSchedule'
import { TrainingScheduleList } from '@/components/features/TrainingScheduleList'
import { DaySelector } from '@/components/common/DaySelector'
import { Layout } from '@/components/common/Layout'
import { Link } from 'react-router-dom'

export const Home = () => {
  const { selectedDay, schedule, isLoading, error, onDayChange } = useTrainingSchedule()

  return (
    <Layout title="Training Record App">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            トレーニング予定
          </h2>
          
          {/* 大きな統計ボタン */}
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📊 統計・分析機能
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                トレーニングの頻度、進捗、筋肉部位別の統計を確認できます
              </p>
              <Link 
                to="/analytics"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
              >
                📊 統計・分析ページを開く
              </Link>
            </div>
          </div>
          
          <DaySelector 
            selectedDay={selectedDay}
            onDayChange={onDayChange}
          />
          
          <TrainingScheduleList 
            schedule={schedule}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </Layout>
  )
}