import type { TrainingRecord } from '@/types'

export class MemoAnalyticsService {
  // よく使われる単語を抽出
  static extractFrequentWords(records: TrainingRecord[], minFrequency = 2): string[] {
    const wordCount = new Map<string, number>()
    
    records.forEach(record => {
      if (record.comment) {
        // 日本語の文を単語に分割（簡易版）
        const words = this.splitJapaneseText(record.comment)
        words.forEach(word => {
          wordCount.set(word, (wordCount.get(word) || 0) + 1)
        })
      }
    })

    return Array.from(wordCount.entries())
      .filter(([_, count]) => count >= minFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  // 感情・状態のキーワードを分析
  static analyzeMoodTrends(records: TrainingRecord[]): {
    positive: string[]
    negative: string[]
    neutral: string[]
  } {
    const positiveKeywords = ['良好', '好調', '順調', '成功', '向上', 'アップ', '最高', '絶好調', '💪', '🎉', '🚀', '🔥']
    const negativeKeywords = ['疲労', '疲れ', 'きつい', '辛い', '不調', '重い', '痛み', '😮‍💨', '😴', '💥']
    const neutralKeywords = ['普通', '通常', 'いつも通り', '標準', 'まあまあ']

    const result = {
      positive: [] as string[],
      negative: [] as string[],
      neutral: [] as string[]
    }

    records.forEach(record => {
      if (record.comment) {
        const comment = record.comment.toLowerCase()
        
        positiveKeywords.forEach(keyword => {
          if (comment.includes(keyword) && !result.positive.includes(keyword)) {
            result.positive.push(keyword)
          }
        })

        negativeKeywords.forEach(keyword => {
          if (comment.includes(keyword) && !result.negative.includes(keyword)) {
            result.negative.push(keyword)
          }
        })

        neutralKeywords.forEach(keyword => {
          if (comment.includes(keyword) && !result.neutral.includes(keyword)) {
            result.neutral.push(keyword)
          }
        })
      }
    })

    return result
  }

  // 曜日別のメモ傾向を分析
  static analyzeDayOfWeekTrends(records: TrainingRecord[]): Map<string, string[]> {
    const dayTrends = new Map<string, string[]>()
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']

    records.forEach(record => {
      if (record.comment) {
        const date = new Date(record.date)
        const dayOfWeek = dayNames[date.getDay()]
        
        if (!dayTrends.has(dayOfWeek)) {
          dayTrends.set(dayOfWeek, [])
        }
        
        const trends = dayTrends.get(dayOfWeek)!
        trends.push(record.comment)
      }
    })

    return dayTrends
  }

  // メモの傾向に基づいて提案を生成
  static generateMemoSuggestions(records: TrainingRecord[]): string[] {
    const frequentWords = this.extractFrequentWords(records)
    const moodTrends = this.analyzeMoodTrends(records)
    const suggestions: string[] = []

    // よく使う単語から提案生成
    if (frequentWords.length > 0) {
      suggestions.push(`${frequentWords[0]}を意識して`)
      if (frequentWords[1]) {
        suggestions.push(`${frequentWords[1]}も重要`)
      }
    }

    // 感情トレンドから提案生成
    if (moodTrends.positive.length > 0) {
      suggestions.push(`今日も${moodTrends.positive[0]}な感じ`)
    }

    // 時間帯別の提案
    const hour = new Date().getHours()
    if (hour < 12) {
      suggestions.push('朝トレーニング！身体の動きは？')
    } else if (hour < 18) {
      suggestions.push('午後の調子はどう？')
    } else {
      suggestions.push('夜トレ。疲労感は？')
    }

    // 曜日別の提案
    const dayOfWeek = new Date().getDay()
    const weekMessages = [
      '週始めの日曜日', '月曜日のスタート', '火曜日の調子',
      '週の中間水曜日', '木曜日の頑張り', '週末前の金曜日', '土曜日のトレーニング'
    ]
    suggestions.push(weekMessages[dayOfWeek])

    return suggestions.slice(0, 6)
  }

  // 日本語テキストを単語に分割（簡易版）
  private static splitJapaneseText(text: string): string[] {
    // 絵文字、記号、数字を除去
    const cleanText = text.replace(/[🏋️‍♀️🏋️‍♂️💪🎉🚀🔥😮‍💨😴💥📷⏰🎤📝🗑️]/g, '')
      .replace(/[0-9]/g, '')
      .replace(/[a-zA-Z]/g, '')
      .replace(/[！？。、]/g, ' ')

    // 2文字以上の単語を抽出
    const words = cleanText.split(/\s+/)
      .filter(word => word.length >= 2 && word.length <= 6)
      .filter(word => !['です', 'ます', 'した', 'ている', 'こと', 'もの', '時間', '今日', '今回'].includes(word))

    return words
  }

  // メモの統計情報を取得
  static getMemoStatistics(records: TrainingRecord[]): {
    totalMemos: number
    averageLength: number
    mostCommonWords: string[]
    memoFrequency: number // パーセンテージ
  } {
    const memosWithComment = records.filter(record => record.comment && record.comment.trim())
    const totalMemos = memosWithComment.length
    const averageLength = totalMemos > 0 
      ? Math.round(memosWithComment.reduce((sum, record) => sum + record.comment!.length, 0) / totalMemos)
      : 0
    
    const mostCommonWords = this.extractFrequentWords(records, 1).slice(0, 5)
    const memoFrequency = records.length > 0 ? Math.round((totalMemos / records.length) * 100) : 0

    return {
      totalMemos,
      averageLength,
      mostCommonWords,
      memoFrequency
    }
  }
}