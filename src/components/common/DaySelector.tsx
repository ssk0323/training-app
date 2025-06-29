import type { DayOfWeek } from '@/types'

interface DaySelectorProps {
  selectedDay: DayOfWeek
  onDayChange: (day: DayOfWeek) => void
}

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
]

export const DaySelector = ({ selectedDay, onDayChange }: DaySelectorProps) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        曜日を選択
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {DAY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onDayChange(value)}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${
                selectedDay === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}