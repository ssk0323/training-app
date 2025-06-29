import { describe, it, expect } from 'vitest'
import { trainingMenuService } from '../trainingMenuService'
import type { CreateTrainingMenuInput } from '@/types'

describe('trainingMenuService', () => {
  describe('create', () => {
    it('should create a new training menu', async () => {
      const input: CreateTrainingMenuInput = {
        name: 'ベンチプレス',
        description: '胸筋を鍛えるメニュー',
        scheduledDays: ['monday', 'wednesday', 'friday'],
      }

      const result = await trainingMenuService.create(input)

      expect(result).toEqual({
        id: expect.any(String),
        name: 'ベンチプレス',
        description: '胸筋を鍛えるメニュー',
        scheduledDays: ['monday', 'wednesday', 'friday'],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should throw error when name is empty', async () => {
      const input: CreateTrainingMenuInput = {
        name: '',
        description: '説明',
        scheduledDays: ['monday'],
      }

      await expect(trainingMenuService.create(input)).rejects.toThrow(
        'メニュー名は必須です'
      )
    })

    it('should throw error when scheduled days is empty', async () => {
      const input: CreateTrainingMenuInput = {
        name: 'テストメニュー',
        description: '説明',
        scheduledDays: [],
      }

      await expect(trainingMenuService.create(input)).rejects.toThrow(
        '実施予定日は1日以上選択してください'
      )
    })
  })
})