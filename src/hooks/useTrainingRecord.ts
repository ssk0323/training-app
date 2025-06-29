import { useState, useEffect } from 'react'
import { menuService, recordService } from '@/lib/serviceConfig'
import type {
  TrainingMenu,
  TrainingRecord,
  CreateTrainingRecordInput,
} from '@/types'

interface TrainingSet {
  weight: number | ''
  reps: number | ''
  duration?: number | ''
  restTime?: number | ''
}

export const useTrainingRecord = (menuId: string) => {
  const [menu, setMenu] = useState<TrainingMenu | null>(null)
  const [previousRecord, setPreviousRecord] = useState<TrainingRecord | null>(
    null
  )
  const [sets, setSets] = useState<TrainingSet[]>([{ weight: '', reps: '' }])
  const [comment, setComment] = useState('')
  const [totalTrainingTime, setTotalTrainingTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load menu
        const currentMenu = await menuService.getById(menuId)
        if (!currentMenu) {
          throw new Error('メニューが見つかりません')
        }
        setMenu(currentMenu)

        // Load previous record
        const latest = await getLatestRecord(menuId)
        setPreviousRecord(latest)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'データの読み込みに失敗しました'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [menuId])

  const addSet = () => {
    setSets(prev => [...prev, { weight: '', reps: '' }])
  }

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateSet = (
    index: number,
    field: keyof TrainingSet,
    value: number | ''
  ) => {
    setSets(prev =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    )
  }

  const copyPreviousRecord = () => {
    if (previousRecord) {
      setSets(
        previousRecord.sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
          duration: set.duration || '',
          restTime: set.restTime || '',
        }))
      )
      setComment(previousRecord.comment || '')
    }
  }

  const validateSets = () => {
    const errors: string[] = []

    sets.forEach((set, index) => {
      if (set.weight === '' || set.weight <= 0) {
        errors.push(`セット${index + 1}: 重量を入力してください`)
      }
      if (set.reps === '' || set.reps <= 0) {
        errors.push(`セット${index + 1}: 回数を入力してください`)
      }
    })

    return errors
  }

  const saveRecord = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)

      const validationErrors = validateSets()
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0])
      }

      const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
          return `${hours}時間${minutes}分${secs}秒`
        } else if (minutes > 0) {
          return `${minutes}分${secs}秒`
        }
        return `${secs}秒`
      }

      let finalComment = comment.trim()
      if (totalTrainingTime > 0) {
        const timeInfo = `トレーニング時間: ${formatTime(totalTrainingTime)}`
        finalComment = finalComment ? `${finalComment}\n${timeInfo}` : timeInfo
      }

      const input: CreateTrainingRecordInput = {
        menuId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        sets: sets.map(set => ({
          weight: Number(set.weight),
          reps: Number(set.reps),
          duration: set.duration ? Number(set.duration) : undefined,
          restTime: set.restTime ? Number(set.restTime) : undefined,
        })),
        comment: finalComment || undefined,
      }

      console.log('保存前の前回の記録:', previousRecord)
      await recordService.create(input)
      setSuccess(true)

      // 前回の記録を更新
      console.log('記録保存後、最新記録を取得中...')
      const latest = await getLatestRecord(menuId)
      console.log('取得した最新記録:', latest)
      setPreviousRecord(latest)

      // Reset form
      setSets([{ weight: '', reps: '' }])
      setComment('')
      setTotalTrainingTime(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '記録の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    menu,
    previousRecord,
    sets,
    comment,
    totalTrainingTime,
    isLoading,
    isSaving,
    error,
    success,
    addSet,
    removeSet,
    updateSet,
    setComment,
    setTotalTrainingTime,
    copyPreviousRecord,
    saveRecord,
  }
}

// 例: 最新の記録取得
const getLatestRecord = async (menuId: string) => {
  const records = await recordService.getByMenuId(menuId)
  return records.length > 0 ? records[0] : null
}
