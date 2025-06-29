import { useState, useEffect } from 'react'
import { menuService, recordService } from '@/lib/serviceConfig'
import type { TrainingMenu, TrainingRecord, CreateTrainingRecordInput } from '@/types'

interface TrainingSet {
  weight: number | ''
  reps: number | ''
  duration?: number | ''
  restTime?: number | ''
}

export const useTrainingRecord = (menuId: string) => {
  const [menu, setMenu] = useState<TrainingMenu | null>(null)
  const [previousRecord, setPreviousRecord] = useState<TrainingRecord | null>(null)
  const [sets, setSets] = useState<TrainingSet[]>([{ weight: '', reps: '' }])
  const [comment, setComment] = useState('')
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
        const latest = await recordService.getLatestByMenuId(menuId)
        setPreviousRecord(latest)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
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

  const updateSet = (index: number, field: keyof TrainingSet, value: number | '') => {
    setSets(prev => prev.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ))
  }

  const copyPreviousRecord = () => {
    if (previousRecord) {
      setSets(previousRecord.sets.map(set => ({
        weight: set.weight,
        reps: set.reps,
        duration: set.duration || '',
        restTime: set.restTime || '',
      })))
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

      const input: CreateTrainingRecordInput = {
        menuId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        sets: sets.map(set => ({
          weight: Number(set.weight),
          reps: Number(set.reps),
          duration: set.duration ? Number(set.duration) : undefined,
          restTime: set.restTime ? Number(set.restTime) : undefined,
        })),
        comment: comment.trim() || undefined,
      }

      await recordService.create(input)
      setSuccess(true)
      
      // Reset form
      setSets([{ weight: '', reps: '' }])
      setComment('')
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
  }
}