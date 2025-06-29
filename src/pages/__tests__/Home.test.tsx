import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/__tests__/test-utils'
import { Home } from '../Home'
import { scheduleService } from '@/lib/serviceConfig'
import type { TrainingMenu } from '@/types'

// Mock the schedule service
vi.mock('@/lib/serviceConfig', () => ({
  scheduleService: {
    getScheduleByDay: vi.fn(),
  },
}))

// Mock dateUtils
vi.mock('@/utils/dateUtils', () => ({
  getCurrentDayOfWeek: vi.fn().mockReturnValue('monday'),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display day selector and training schedule for selected day', async () => {
    const mockSchedule: TrainingMenu[] = [
      {
        id: '1',
        name: 'ベンチプレス',
        description: '胸筋を鍛えるメニュー',
        scheduledDays: ['monday', 'friday'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'スクワット',
        description: '脚を鍛えるメニュー',
        scheduledDays: ['monday', 'wednesday'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(scheduleService.getScheduleByDay).mockResolvedValue(mockSchedule)

    render(<Home />)

    expect(screen.getByText('トレーニング予定')).toBeInTheDocument()
    expect(screen.getByText('曜日を選択')).toBeInTheDocument()
    expect(screen.getByText('月曜日')).toBeInTheDocument()
    expect(await screen.findByText('ベンチプレス')).toBeInTheDocument()
    expect(await screen.findByText('スクワット')).toBeInTheDocument()
    expect(screen.getByText('胸筋を鍛えるメニュー')).toBeInTheDocument()
    expect(screen.getByText('脚を鍛えるメニュー')).toBeInTheDocument()
  })

  it('should display empty state when no trainings are scheduled for selected day', async () => {
    vi.mocked(scheduleService.getScheduleByDay).mockResolvedValue([])

    render(<Home />)

    expect(screen.getByText('トレーニング予定')).toBeInTheDocument()
    expect(await screen.findByText('今日は予定されているトレーニングがありません')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    vi.mocked(scheduleService.getScheduleByDay).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<Home />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should update schedule when different day is selected', async () => {
    const mondaySchedule: TrainingMenu[] = [
      {
        id: '1',
        name: 'ベンチプレス',
        description: '胸筋を鍛えるメニュー',
        scheduledDays: ['monday'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    const tuesdaySchedule: TrainingMenu[] = [
      {
        id: '2',
        name: 'スクワット',
        description: '脚を鍛えるメニュー',
        scheduledDays: ['tuesday'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(scheduleService.getScheduleByDay)
      .mockResolvedValueOnce(mondaySchedule)
      .mockResolvedValueOnce(tuesdaySchedule)

    render(<Home />)

    expect(await screen.findByText('ベンチプレス')).toBeInTheDocument()

    fireEvent.click(screen.getByText('火曜日'))

    expect(await screen.findByText('スクワット')).toBeInTheDocument()
    expect(vi.mocked(scheduleService.getScheduleByDay)).toHaveBeenCalledWith('tuesday')
  })
})