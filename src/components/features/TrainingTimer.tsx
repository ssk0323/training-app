import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/common/Button'

interface TrainingTimerProps {
  onTotalTimeUpdate?: (seconds: number) => void
}

export const TrainingTimer = ({ onTotalTimeUpdate }: TrainingTimerProps) => {
  const [totalTime, setTotalTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const totalTimerRef = useRef<number | null>(null)

  // トレーニング全体時間の管理
  useEffect(() => {
    if (isTimerRunning) {
      totalTimerRef.current = window.setInterval(() => {
        setTotalTime(prev => {
          const newTime = prev + 1
          onTotalTimeUpdate?.(newTime)
          return newTime
        })
      }, 1000)
    } else {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current)
        totalTimerRef.current = null
      }
    }

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current)
      }
    }
  }, [isTimerRunning, onTotalTimeUpdate])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTotalTime(0)
    onTotalTimeUpdate?.(0)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        ⏱️ トレーニングタイマー
      </h3>

      {/* 全体時間 */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-1">トレーニング時間</div>
        <div className="text-3xl font-mono text-blue-600">
          {formatTime(totalTime)}
        </div>

        {/* タイマー操作ボタン */}
        <div className="flex gap-2 justify-center mt-3">
          {!isTimerRunning ? (
            <Button variant="primary" size="sm" onClick={startTimer}>
              ▶️ 開始
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={pauseTimer}>
              ⏸️ 一時停止
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={resetTimer}>
            🔄 リセット
          </Button>
        </div>
      </div>
    </div>
  )
}
