import { useTrainingSchedule } from '@/hooks/useTrainingSchedule'
import { TrainingScheduleList } from '@/components/features/TrainingScheduleList'
import { DaySelector } from '@/components/common/DaySelector'
import { Layout } from '@/components/common/Layout'
import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/contexts/AuthContext'

export const Home = () => {
  const { selectedDay, schedule, isLoading, error, onDayChange } =
    useTrainingSchedule()
  const { user } = useAuth()

  return (
    <Layout title="Training Record App">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                トレーニング予定
              </h2>
              {user && (
                <p className="text-gray-600 mt-1">
                  ようこそ、{user.name}さん！
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link to="/menu-list">
                <Button variant="secondary" size="sm">
                  📋 メニュー一覧
                </Button>
              </Link>
              <Link to="/create-menu">
                <Button variant="primary" size="sm">
                  ➕ メニュー作成
                </Button>
              </Link>
            </div>
          </div>

          <DaySelector selectedDay={selectedDay} onDayChange={onDayChange} />

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
