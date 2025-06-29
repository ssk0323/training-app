import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trainingScheduleService } from '../trainingScheduleService'
import { trainingMenuService } from '../trainingMenuService'
import type { TrainingMenu } from '@/types'

// Mock the trainingMenuService
vi.mock('../trainingMenuService', () => ({
  trainingMenuService: {
    getAll: vi.fn(),
  },
}))

// Mock the dateUtils
vi.mock('@/utils/dateUtils', () => ({
  getCurrentDayOfWeek: vi.fn(),
  formatDate: vi.fn(),
  parseDate: vi.fn(),
}))

describe('trainingScheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getScheduleByDay', () => {
    it('should return training menus scheduled for specified day', async () => {
      const mockMenus: TrainingMenu[] = [
        {
          id: '1',
          name: 'ベンチプレス',
          description: '胸筋',
          scheduledDays: ['monday', 'wednesday', 'friday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'スクワット',
          description: '脚',
          scheduledDays: ['tuesday', 'thursday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'デッドリフト',
          description: '背中',
          scheduledDays: ['monday', 'friday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(trainingMenuService.getAll).mockResolvedValue(mockMenus)

      const result = await trainingScheduleService.getScheduleByDay('monday')

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        expect.objectContaining({ name: 'ベンチプレス' }),
        expect.objectContaining({ name: 'デッドリフト' }),
      ])
    })

    it('should return empty array when no menus are scheduled for specified day', async () => {
      const mockMenus: TrainingMenu[] = [
        {
          id: '1',
          name: 'ベンチプレス',
          description: '胸筋',
          scheduledDays: ['tuesday', 'thursday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(trainingMenuService.getAll).mockResolvedValue(mockMenus)

      const result = await trainingScheduleService.getScheduleByDay('monday')

      expect(result).toHaveLength(0)
    })
  })

  describe('getTodaysSchedule', () => {
    it('should return training menus scheduled for today', async () => {
      const mockMenus: TrainingMenu[] = [
        {
          id: '1',
          name: 'ベンチプレス',
          description: '胸筋',
          scheduledDays: ['monday', 'wednesday', 'friday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'スクワット',
          description: '脚',
          scheduledDays: ['tuesday', 'thursday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'デッドリフト',
          description: '背中',
          scheduledDays: ['monday', 'friday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      const { getCurrentDayOfWeek } = await import('@/utils/dateUtils')
      
      vi.mocked(trainingMenuService.getAll).mockResolvedValue(mockMenus)
      vi.mocked(getCurrentDayOfWeek).mockReturnValue('monday')

      const result = await trainingScheduleService.getTodaysSchedule()

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        expect.objectContaining({ name: 'ベンチプレス' }),
        expect.objectContaining({ name: 'デッドリフト' }),
      ])
    })

    it('should return empty array when no menus are scheduled for today', async () => {
      const mockMenus: TrainingMenu[] = [
        {
          id: '1',
          name: 'ベンチプレス',
          description: '胸筋',
          scheduledDays: ['tuesday', 'thursday'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(trainingMenuService.getAll).mockResolvedValue(mockMenus)

      const result = await trainingScheduleService.getTodaysSchedule()

      expect(result).toHaveLength(0)
    })
  })
})