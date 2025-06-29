import { describe, it, expect, beforeEach } from 'vitest'
import { trainingRecordService } from '../trainingRecordService'
import type { CreateTrainingRecordInput } from '@/types'

describe('trainingRecordService', () => {
  beforeEach(() => {
    // Clear records before each test
    trainingRecordService['records'] = []
  })

  describe('create', () => {
    it('should create a new training record', async () => {
      const input: CreateTrainingRecordInput = {
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [
          { weight: 50, reps: 10 },
          { weight: 50, reps: 8 },
          { weight: 50, reps: 6 },
        ],
        comment: '今日は調子が良かった',
      }

      const result = await trainingRecordService.create(input)

      expect(result).toEqual({
        id: expect.any(String),
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [
          { id: expect.any(String), weight: 50, reps: 10 },
          { id: expect.any(String), weight: 50, reps: 8 },
          { id: expect.any(String), weight: 50, reps: 6 },
        ],
        comment: '今日は調子が良かった',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should throw error when sets is empty', async () => {
      const input: CreateTrainingRecordInput = {
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [],
      }

      await expect(trainingRecordService.create(input)).rejects.toThrow(
        'セット数は1つ以上入力してください'
      )
    })

    it('should throw error when weight is invalid', async () => {
      const input: CreateTrainingRecordInput = {
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [{ weight: 0, reps: 10 }],
      }

      await expect(trainingRecordService.create(input)).rejects.toThrow(
        '重量は0より大きい値を入力してください'
      )
    })

    it('should throw error when reps is invalid', async () => {
      const input: CreateTrainingRecordInput = {
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [{ weight: 50, reps: 0 }],
      }

      await expect(trainingRecordService.create(input)).rejects.toThrow(
        '回数は0より大きい値を入力してください'
      )
    })
  })

  describe('getLatestByMenuId', () => {
    it('should return the latest record for a menu', async () => {
      // Create test records
      await trainingRecordService.create({
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [{ weight: 40, reps: 10 }],
      })

      await trainingRecordService.create({
        menuId: 'menu-1',
        date: '2024-01-03',
        sets: [{ weight: 50, reps: 8 }],
      })

      await trainingRecordService.create({
        menuId: 'menu-1',
        date: '2024-01-02',
        sets: [{ weight: 45, reps: 9 }],
      })

      const latest = await trainingRecordService.getLatestByMenuId('menu-1')

      expect(latest).toEqual(
        expect.objectContaining({
          date: '2024-01-03',
          sets: [expect.objectContaining({ weight: 50, reps: 8 })],
        })
      )
    })

    it('should return null when no records exist for menu', async () => {
      const latest = await trainingRecordService.getLatestByMenuId('non-existent')
      expect(latest).toBeNull()
    })
  })

  describe('getByMenuId', () => {
    it('should return records sorted by date descending', async () => {
      await trainingRecordService.create({
        menuId: 'menu-1',
        date: '2024-01-01',
        sets: [{ weight: 40, reps: 10 }],
      })

      await trainingRecordService.create({
        menuId: 'menu-1',
        date: '2024-01-03',
        sets: [{ weight: 50, reps: 8 }],
      })

      await trainingRecordService.create({
        menuId: 'menu-2',
        date: '2024-01-02',
        sets: [{ weight: 30, reps: 12 }],
      })

      const records = await trainingRecordService.getByMenuId('menu-1')

      expect(records).toHaveLength(2)
      expect(records[0].date).toBe('2024-01-03')
      expect(records[1].date).toBe('2024-01-01')
    })
  })
})