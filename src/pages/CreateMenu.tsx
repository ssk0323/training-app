import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Layout } from '@/components/common/Layout'
import { useCreateMenu } from '@/hooks/useCreateMenu'
import type { DayOfWeek } from '@/types'

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
]

export const CreateMenu = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { isLoading, error, success, createMenu } = useCreateMenu()

  // Reset form on successful creation
  useEffect(() => {
    if (success) {
      setName('')
      setDescription('')
      setScheduledDays([])
      setValidationErrors({})
    }
  }, [success])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!name.trim()) {
      errors.name = 'メニュー名は必須です'
    }
    
    if (scheduledDays.length === 0) {
      errors.scheduledDays = '実施予定日は1日以上選択してください'
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }

    await createMenu({
      name: name.trim(),
      description: description.trim(),
      scheduledDays,
    })
  }

  const handleDayChange = (day: DayOfWeek, checked: boolean) => {
    if (checked) {
      setScheduledDays(prev => [...prev, day])
    } else {
      setScheduledDays(prev => prev.filter(d => d !== day))
    }
    
    // Clear validation error if days are selected
    if (validationErrors.scheduledDays && checked) {
      setValidationErrors(prev => ({ ...prev, scheduledDays: '' }))
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (validationErrors.name && e.target.value.trim()) {
      setValidationErrors(prev => ({ ...prev, name: '' }))
    }
  }

  return (
    <Layout title="トレーニングメニュー作成" showBackButton>
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <Input
                label="メニュー名"
                value={name}
                onChange={handleNameChange}
                error={validationErrors.name}
                placeholder="例: ベンチプレス"
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-primary w-full"
                  placeholder="例: 胸筋を鍛えるメニュー"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  実施予定日
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DAY_OPTIONS.map(({ value, label }) => (
                    <Checkbox
                      key={value}
                      label={label}
                      checked={scheduledDays.includes(value)}
                      onChange={(e) => handleDayChange(value, e.target.checked)}
                    />
                  ))}
                </div>
                {validationErrors.scheduledDays && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.scheduledDays}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800">{error}</div>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-green-800">メニューを作成しました</div>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                作成
              </Button>
            </form>
        </div>
      </div>
    </Layout>
  )
}