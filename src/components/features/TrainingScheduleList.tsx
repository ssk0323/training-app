import { Link } from 'react-router-dom'
import type { TrainingMenu } from '@/types'

interface TrainingScheduleListProps {
  schedule: TrainingMenu[]
  isLoading: boolean
  error: string | null
}

export const TrainingScheduleList = ({ schedule, isLoading, error }: TrainingScheduleListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    )
  }

  if (schedule.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">今日は予定されているトレーニングがありません</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {schedule.map((menu) => (
        <Link
          key={menu.id}
          to={`/training/${menu.id}`}
          className="block bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {menu.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {menu.description}
          </p>
        </Link>
      ))}
    </div>
  )
}