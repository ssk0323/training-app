import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { MemoAnalyticsService } from '@/services/memoAnalyticsService'
import { MemoStatistics } from './MemoStatistics'
import { getTrainingRecordService } from '@/services/serviceConfig'
import type { TrainingRecord } from '@/types'

interface EnhancedMemoProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  menuId?: string
}

const MEMO_TEMPLATES = [
  '今日の調子: 良好 💪',
  '重量アップ成功！ 🎉',
  'フォームを意識して丁寧に 🎯',
  'いつもより疲労感あり 😮‍💨',
  '新しい重量に挑戦 🚀',
  'インターバルを短めに設定 ⏱️',
  '筋肉の張りを強く感じる 💪',
  '集中力が高まっている 🔥',
]

export const EnhancedMemo = ({
  value,
  onChange,
  placeholder = '今日の調子や気づいたことなど...',
  menuId,
}: EnhancedMemoProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [recognition, setRecognition] = useState<any | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 過去のレコードを読み込んで提案を生成
  useEffect(() => {
    const loadRecordsAndGenerateSuggestions = async () => {
      if (menuId) {
        try {
          const recordService = getTrainingRecordService()
          const allRecords = await recordService.getByMenuId(menuId)
          setRecords(allRecords)
          const generatedSuggestions =
            MemoAnalyticsService.generateMemoSuggestions(allRecords)
          setSuggestions(generatedSuggestions)
        } catch (error) {
          console.error('レコード読み込みエラー:', error)
        }
      }
    }

    loadRecordsAndGenerateSuggestions()
  }, [menuId])

  // 音声認識の設定
  const initSpeechRecognition = useCallback(() => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      alert('お使いのブラウザは音声認識に対応していません')
      return null
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onChange(value + (value ? '\n' : '') + transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error)
      setIsRecording(false)
      alert('音声認識でエラーが発生しました')
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    return recognition
  }, [value, onChange])

  const startVoiceInput = () => {
    const speechRecognition = initSpeechRecognition()
    if (speechRecognition) {
      setRecognition(speechRecognition)
      setIsRecording(true)
      speechRecognition.start()
    }
  }

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const handleTemplateSelect = (template: string) => {
    const newValue = value + (value ? '\n' : '') + template
    onChange(newValue)
    setShowTemplates(false)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const imageDataUrl = e.target?.result as string
        const imageInfo = `📷 画像添付: ${file.name} (${Math.round(file.size / 1024)}KB)`
        onChange(value + (value ? '\n' : '') + imageInfo)

        // 実際のアプリでは画像をクラウドストレージにアップロードし、URLを保存する
        console.log('画像データ:', imageDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const addCurrentTime = () => {
    const now = new Date()
    const timeString = `⏰ ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    onChange(value + (value ? '\n' : '') + timeString)
  }

  const clearMemo = () => {
    if (value && confirm('メモの内容をクリアしますか？')) {
      onChange('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          メモ・コメント
        </label>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            title="テンプレート"
          >
            📝
          </Button>
          {suggestions.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              title="AI提案"
            >
              🤖
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={addCurrentTime}
            title="現在時刻を追加"
          >
            ⏰
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="写真を添付"
          >
            📷
          </Button>
          {!isRecording ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={startVoiceInput}
              title="音声入力"
            >
              🎤
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={stopVoiceInput}
              title="音声入力停止"
            >
              ⏹️
            </Button>
          )}
          {records.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStatistics(true)}
              title="メモ分析"
            >
              📊
            </Button>
          )}
          {value && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearMemo}
              title="クリア"
            >
              🗑️
            </Button>
          )}
        </div>
      </div>

      {/* 音声認識中の表示 */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center text-red-700">
            <div className="animate-pulse mr-2">🔴</div>
            音声を録音中... 話してください
          </div>
        </div>
      )}

      {/* AI提案 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2">
            🤖 あなたの傾向から提案
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="text-left text-sm bg-white hover:bg-blue-100 border border-blue-300 rounded px-3 py-2 transition-colors"
                onClick={() => handleTemplateSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          {records.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-xs text-blue-600">
                過去{records.length}回のトレーニングデータから分析
              </div>
            </div>
          )}
        </div>
      )}

      {/* テンプレート選択 */}
      {showTemplates && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            📝 定型テンプレート
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MEMO_TEMPLATES.map((template, index) => (
              <button
                key={index}
                className="text-left text-sm bg-white hover:bg-blue-50 border border-gray-300 rounded px-3 py-2 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* メインのテキストエリア */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-primary w-full"
        placeholder={placeholder}
        rows={4}
      />

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 文字数カウンター */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>{value.length > 0 && `${value.length}文字`}</div>
        <div className="text-xs">
          🎤 音声入力 | 📝 テンプレート | 🤖 AI提案 | 📷 写真添付 | 📊 分析
        </div>
      </div>

      {/* メモ統計モーダル */}
      <MemoStatistics
        menuId={menuId}
        isVisible={showStatistics}
        onClose={() => setShowStatistics(false)}
      />
    </div>
  )
}

// TypeScript の型定義拡張
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
