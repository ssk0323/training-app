import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { TrainingRecord } from '../TrainingRecord'
import { trainingMenuService } from '@/services/trainingMenuService'
import { trainingRecordService } from '@/services/trainingRecordService'
import type { TrainingMenu, TrainingRecord as TrainingRecordType } from '@/types'

// Mock services
vi.mock('@/services/trainingMenuService', () => ({
  trainingMenuService: {
    getAll: vi.fn(),
  },
}))

vi.mock('@/services/trainingRecordService', () => ({
  trainingRecordService: {
    getLatestByMenuId: vi.fn(),
    create: vi.fn(),
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ menuId: 'menu-1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('TrainingRecord', () => {
  const user = userEvent.setup()

  const mockMenu: TrainingMenu = {
    id: 'menu-1',
    name: 'ベンチプレス',
    description: '胸筋を鍛えるメニュー',
    scheduledDays: ['monday', 'wednesday', 'friday'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  const mockPreviousRecord: TrainingRecordType = {
    id: 'record-1',
    menuId: 'menu-1',
    date: '2024-01-01',
    sets: [
      { id: 'set-1', weight: 50, reps: 10 },
      { id: 'set-2', weight: 50, reps: 8 },
      { id: 'set-3', weight: 50, reps: 6 },
    ],
    comment: '前回のトレーニング',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(trainingMenuService.getAll).mockResolvedValue([mockMenu])
    // Reset any previous mock implementations
    vi.mocked(trainingRecordService.getLatestByMenuId).mockReset()
    vi.mocked(trainingRecordService.create).mockReset()
  })

  it('should display menu name and previous record', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(mockPreviousRecord)

    render(<TrainingRecord />)

    expect(await screen.findByText('ベンチプレス')).toBeInTheDocument()
    expect(screen.getByText('前回の記録')).toBeInTheDocument()
    expect(screen.getByText('50kg × 10回')).toBeInTheDocument()
    expect(screen.getByText('50kg × 8回')).toBeInTheDocument()
    expect(screen.getByText('50kg × 6回')).toBeInTheDocument()
    expect(screen.getByText('前回のトレーニング')).toBeInTheDocument()
  })

  it('should display no previous record message', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(null)

    render(<TrainingRecord />)

    expect(await screen.findByText('前回の記録はありません')).toBeInTheDocument()
  })

  it('should allow adding and removing sets', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(null)

    render(<TrainingRecord />)

    // Initial state should have one set
    expect(screen.getByText('セット 1')).toBeInTheDocument()

    // Add a set
    await user.click(screen.getByText('セット追加'))
    expect(screen.getByText('セット 2')).toBeInTheDocument()

    // Add another set
    await user.click(screen.getByText('セット追加'))
    expect(screen.getByText('セット 3')).toBeInTheDocument()

    // Remove the middle set
    const removeButtons = screen.getAllByText('削除')
    await user.click(removeButtons[1]) // Remove second set

    // Should now have sets 1 and 2 (renumbered)
    expect(screen.getByText('セット 1')).toBeInTheDocument()
    expect(screen.getByText('セット 2')).toBeInTheDocument()
    expect(screen.queryByText('セット 3')).not.toBeInTheDocument()
  })

  it('should create training record with valid input', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(null)
    vi.mocked(trainingRecordService.create).mockResolvedValue({
      ...mockPreviousRecord,
      id: 'new-record',
      date: '2024-01-02',
    })

    render(<TrainingRecord />)

    // Fill in the form
    const weightInputs = screen.getAllByLabelText(/重量/)
    const repsInputs = screen.getAllByLabelText(/回数/)
    
    await user.type(weightInputs[0], '60')
    await user.type(repsInputs[0], '8')

    const commentInput = screen.getByLabelText('コメント')
    await user.type(commentInput, '今日は頑張った')

    // Submit the form
    await user.click(screen.getByRole('button', { name: '記録する' }))

    await waitFor(() => {
      expect(trainingRecordService.create).toHaveBeenCalledWith({
        menuId: 'menu-1',
        date: expect.any(String),
        sets: [{ weight: 60, reps: 8 }],
        comment: '今日は頑張った',
      })
    })

    expect(await screen.findByText('記録を保存しました')).toBeInTheDocument()
  })

  it('should show validation errors for invalid input', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(null)

    render(<TrainingRecord />)

    // Try to submit with empty values
    await user.click(screen.getByRole('button', { name: '記録する' }))

    expect(await screen.findByText('重量を入力してください')).toBeInTheDocument()
    expect(screen.getByText('回数を入力してください')).toBeInTheDocument()
  })

  it('should copy previous record values when copy button is clicked', async () => {
    vi.mocked(trainingRecordService.getLatestByMenuId).mockResolvedValue(mockPreviousRecord)

    render(<TrainingRecord />)

    await user.click(await screen.findByText('前回の記録をコピー'))

    // Wait for the form to be populated
    await waitFor(() => {
      const weightInputs = screen.getAllByLabelText(/重量/)
      const repsInputs = screen.getAllByLabelText(/回数/)

      expect(weightInputs[0]).toHaveValue(50)
      expect(repsInputs[0]).toHaveValue(10)
      expect(weightInputs[1]).toHaveValue(50)
      expect(repsInputs[1]).toHaveValue(8)
      expect(weightInputs[2]).toHaveValue(50)
      expect(repsInputs[2]).toHaveValue(6)
    })
  })
})