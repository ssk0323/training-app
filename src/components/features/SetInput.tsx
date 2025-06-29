import { useState, useEffect, useRef } from 'react'
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
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerTime, setTimerTime] = useState(0)
  const intervalRef = useRef<number | null>(null)

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

  const startTimer = () => {
    setIsTimerRunning(true)
    if (timerTime === 0) {
      setTimerTime(0)
    }
    intervalRef.current = window.setInterval(() => {
      setTimerTime(prev => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsTimerRunning(false)
    if (onRestTimeChange && timerTime > 0) {
      onRestTimeChange(timerTime)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

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
          onChange={e => handleNumberChange(e.target.value, onWeightChange)}
          placeholder="50"
          step="0.1"
          min="0"
        />

        <Input
          label="回数"
          type="number"
          value={reps}
          onChange={e => handleNumberChange(e.target.value, onRepsChange)}
          placeholder="10"
          step="1"
          min="0"
        />

        {onDurationChange && (
          <Input
            label="時間 (秒)"
            type="number"
            value={duration || ''}
            onChange={e => handleNumberChange(e.target.value, onDurationChange)}
            placeholder="30"
            step="1"
            min="0"
          />
        )}

        {onRestTimeChange && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              休憩時間
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-mono text-gray-900">
                  {formatTime(timerTime)}
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning ? (
                    <Button variant="primary" size="sm" onClick={startTimer}>
                      ⏱️ 開始
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={pauseTimer}>
                      ⏸️ 一時停止
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  label="手動入力 (秒)"
                  type="number"
                  value={restTime || ''}
                  onChange={e =>
                    handleNumberChange(e.target.value, onRestTimeChange)
                  }
                  placeholder="90"
                  step="1"
                  min="0"
                />
                <div className="text-xs text-gray-500 mt-6">
                  タイマーで測定するか、手動で入力できます
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
