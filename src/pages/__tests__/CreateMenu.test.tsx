import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { CreateMenu } from '../CreateMenu'
import { trainingMenuService } from '@/services/trainingMenuService'

// Mock the trainingMenuService
vi.mock('@/services/trainingMenuService', () => ({
  trainingMenuService: {
    create: vi.fn(),
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('CreateMenu', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render menu creation form', () => {
    render(<CreateMenu />)

    expect(screen.getByText('トレーニングメニュー作成')).toBeInTheDocument()
    expect(screen.getByLabelText('メニュー名')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByText('実施予定日')).toBeInTheDocument()
    expect(screen.getByLabelText('月曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('火曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('水曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('木曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('金曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('土曜日')).toBeInTheDocument()
    expect(screen.getByLabelText('日曜日')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
  })

  it('should create training menu with valid input', async () => {
    const mockMenu = {
      id: '1',
      name: 'ベンチプレス',
      description: '胸筋を鍛えるメニュー',
      scheduledDays: ['monday', 'wednesday', 'friday'] as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(trainingMenuService.create).mockResolvedValue(mockMenu)

    render(<CreateMenu />)

    // Fill in form
    await user.type(screen.getByLabelText('メニュー名'), 'ベンチプレス')
    await user.type(screen.getByLabelText('説明'), '胸筋を鍛えるメニュー')
    await user.click(screen.getByLabelText('月曜日'))
    await user.click(screen.getByLabelText('水曜日'))
    await user.click(screen.getByLabelText('金曜日'))

    // Submit form
    await user.click(screen.getByRole('button', { name: '作成' }))

    await waitFor(() => {
      expect(trainingMenuService.create).toHaveBeenCalledWith({
        name: 'ベンチプレス',
        description: '胸筋を鍛えるメニュー',
        scheduledDays: ['monday', 'wednesday', 'friday'],
      })
    })

    expect(screen.getByText('メニューを作成しました')).toBeInTheDocument()
  })

  it('should show validation error for empty name', async () => {
    render(<CreateMenu />)

    // Try to submit without name
    await user.click(screen.getByRole('button', { name: '作成' }))

    expect(screen.getByText('メニュー名は必須です')).toBeInTheDocument()
    expect(trainingMenuService.create).not.toHaveBeenCalled()
  })

  it('should show validation error when no days selected', async () => {
    render(<CreateMenu />)

    // Fill name but no days
    await user.type(screen.getByLabelText('メニュー名'), 'テストメニュー')
    await user.click(screen.getByRole('button', { name: '作成' }))

    expect(screen.getByText('実施予定日は1日以上選択してください')).toBeInTheDocument()
    expect(trainingMenuService.create).not.toHaveBeenCalled()
  })

  it('should handle service error', async () => {
    vi.mocked(trainingMenuService.create).mockRejectedValue(
      new Error('作成に失敗しました')
    )

    render(<CreateMenu />)

    await user.type(screen.getByLabelText('メニュー名'), 'テストメニュー')
    await user.click(screen.getByLabelText('月曜日'))
    await user.click(screen.getByRole('button', { name: '作成' }))

    await waitFor(() => {
      expect(screen.getByText('作成に失敗しました')).toBeInTheDocument()
    })
  })

  it('should reset form after successful creation', async () => {
    const mockMenu = {
      id: '1',
      name: 'テストメニュー',
      description: 'テスト説明',
      scheduledDays: ['monday'] as any,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    vi.mocked(trainingMenuService.create).mockResolvedValue(mockMenu)

    render(<CreateMenu />)

    await user.type(screen.getByLabelText('メニュー名'), 'テストメニュー')
    await user.type(screen.getByLabelText('説明'), 'テスト説明')
    await user.click(screen.getByLabelText('月曜日'))
    await user.click(screen.getByRole('button', { name: '作成' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument() // Name input should be empty
    })
  })
})