import type { TrainingRecord } from '@/types'
import { Button } from '@/components/common/Button'

interface PreviousRecordProps {
  record: TrainingRecord | null
  onCopy?: () => void
}

export const PreviousRecord = ({ record, onCopy }: PreviousRecordProps) => {
  if (!record) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">前回の記録</h3>
        <p className="text-gray-500">前回の記録はありません</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-900">前回の記録</h3>
        {onCopy && (
          <Button variant="secondary" size="sm" onClick={onCopy}>
            前回の記録をコピー
          </Button>
        )}
      </div>
      
      <div className="space-y-2 mb-3">
        <p className="text-sm text-gray-600">
          日付: {new Date(record.date).toLocaleDateString('ja-JP')}
        </p>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">セット内容:</p>
          <div className="space-y-1">
            {record.sets.map((set) => (
              <p key={set.id} className="text-sm text-gray-600 pl-2">
                {set.weight}kg × {set.reps}回
                {set.duration && ` (${set.duration}秒)`}
              </p>
            ))}
          </div>
        </div>
      </div>
      
      {record.comment && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">コメント:</p>
          <p className="text-sm text-gray-600 pl-2">{record.comment}</p>
        </div>
      )}
    </div>
  )
}