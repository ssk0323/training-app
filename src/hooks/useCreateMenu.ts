import { useState } from 'react'
import { menuService } from '@/lib/serviceConfig'
import type { CreateTrainingMenuInput } from '@/types'

interface UseCreateMenuReturn {
  isLoading: boolean
  error: string | null
  success: boolean
  createMenu: (input: CreateTrainingMenuInput) => Promise<void>
  resetState: () => void
}

export const useCreateMenu = (): UseCreateMenuReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createMenu = async (input: CreateTrainingMenuInput) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)
      
      await menuService.create(input)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メニューの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
  }

  return {
    isLoading,
    error,
    success,
    createMenu,
    resetState,
  }
}