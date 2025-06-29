import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

interface SetInputProps {
  setNumber: number
  weight: number | ''
  reps: number | ''
  duration?: number | ''
  restTime?: number | ''
  onWeightChange: (value: number | '') => void
  onRepsChange: (value: number | '') => void
  onDurationChange?: (value: number | '') => void
  onRestTimeChange?: (value: number | '') => void
  onRemove: () => void
  canRemove: boolean
}

export const SetInput = ({
  setNumber,
  weight,
  reps,
  duration,
  restTime,
  onWeightChange,
  onRepsChange,
  onDurationChange,
  onRestTimeChange,
  onRemove,
  canRemove,
}: SetInputProps) => {
  const handleNumberChange = (
    value: string,
    onChange: (value: number | '') => void
  ) => {
    if (value === '') {
      onChange('')
    } else {
      const num = parseFloat(value)
      if (!isNaN(num) && num >= 0) {
        onChange(num)
      }
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-medium text-gray-900">
          セット {setNumber}
        </h4>
        {canRemove && (
          <Button variant="secondary" size="sm" onClick={onRemove}>
            削除
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="重量 (kg)"
          type="number"
          value={weight}
          onChange={(e) => handleNumberChange(e.target.value, onWeightChange)}
          placeholder="50"
          step="0.1"
          min="0"
        />
        
        <Input
          label="回数"
          type="number"
          value={reps}
          onChange={(e) => handleNumberChange(e.target.value, onRepsChange)}
          placeholder="10"
          step="1"
          min="0"
        />
        
        {onDurationChange && (
          <Input
            label="時間 (秒)"
            type="number"
            value={duration || ''}
            onChange={(e) => handleNumberChange(e.target.value, onDurationChange)}
            placeholder="30"
            step="1"
            min="0"
          />
        )}
        
        {onRestTimeChange && (
          <Input
            label="休憩時間 (秒)"
            type="number"
            value={restTime || ''}
            onChange={(e) => handleNumberChange(e.target.value, onRestTimeChange)}
            placeholder="90"
            step="1"
            min="0"
          />
        )}
      </div>
    </div>
  )
}