import { useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Layout } from '@/components/common/Layout'
import { PreviousRecord } from '@/components/features/PreviousRecord'
import { SetInput } from '@/components/features/SetInput'
import { useTrainingRecord } from '@/hooks/useTrainingRecord'

export const TrainingRecord = () => {
  const { menuId } = useParams<{ menuId: string }>()
  
  const {
    menu,
    previousRecord,
    sets,
    comment,
    isLoading,
    isSaving,
    error,
    success,
    addSet,
    removeSet,
    updateSet,
    setComment,
    copyPreviousRecord,
    saveRecord,
  } = useTrainingRecord(menuId!)

  if (isLoading) {
    return (
      <Layout title="読み込み中..." showBackButton>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">読み込み中...</div>
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
    <Layout title={menu.name} subtitle={menu.description} showBackButton>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0 space-y-6">
          {/* Previous Record */}
          <PreviousRecord 
            record={previousRecord} 
            onCopy={previousRecord ? copyPreviousRecord : undefined}
          />

          {/* Training Record Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              今日のトレーニング
            </h2>

            {/* Sets */}
            <div className="space-y-4 mb-6">
              {sets.map((set, index) => (
                <SetInput
                  key={index}
                  setNumber={index + 1}
                  weight={set.weight}
                  reps={set.reps}
                  duration={set.duration}
                  restTime={set.restTime}
                  onWeightChange={(value) => updateSet(index, 'weight', value)}
                  onRepsChange={(value) => updateSet(index, 'reps', value)}
                  onDurationChange={(value) => updateSet(index, 'duration', value)}
                  onRestTimeChange={(value) => updateSet(index, 'restTime', value)}
                  onRemove={() => removeSet(index)}
                  canRemove={sets.length > 1}
                />
              ))}
            </div>

            {/* Add Set Button */}
            <div className="mb-6">
              <Button variant="secondary" onClick={addSet}>
                セット追加
              </Button>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-primary w-full"
                placeholder="今日の調子や気づいたことなど..."
                rows={3}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-green-800">記録を保存しました</div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={saveRecord}
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              記録する
            </Button>
        </div>
      </div>
    </Layout>
  )
}