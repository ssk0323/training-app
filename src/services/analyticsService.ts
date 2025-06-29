import type { TrainingRecord, TrainingMenu } from '@/types'

export interface WeeklyFrequency {
  week: string // YYYY-MM-DD (Monday of week)
  count: number
  date: Date
}

export interface MonthlyFrequency {
  month: string // YYYY-MM
  count: number
  date: Date
}

export interface ProgressData {
  date: string
  weight: number
  reps: number
  volume: number // weight * reps
  maxWeight: number
  totalReps: number
}

export interface MuscleGroupStats {
  muscleGroup: string
  totalSessions: number
  totalVolume: number
  averageWeight: number
  lastTrained: string
}

class AnalyticsService {
  /**
   * 週間トレーニング頻度を計算
   */
  calculateWeeklyFrequency(records: TrainingRecord[]): WeeklyFrequency[] {
    const weeklyData = new Map<string, number>()
    
    records.forEach(record => {
      const date = new Date(record.date)
      const monday = this.getMonday(date)
      const weekKey = monday.toISOString().split('T')[0]
      
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1)
    })
    
    return Array.from(weeklyData.entries())
      .map(([week, count]) => ({
        week,
        count,
        date: new Date(week)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * 月間トレーニング頻度を計算
   */
  calculateMonthlyFrequency(records: TrainingRecord[]): MonthlyFrequency[] {
    const monthlyData = new Map<string, number>()
    
    records.forEach(record => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
    })
    
    return Array.from(monthlyData.entries())
      .map(([month, count]) => ({
        month,
        count,
        date: new Date(month + '-01')
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * 特定メニューの進捗データを計算
   */
  calculateProgress(records: TrainingRecord[]): ProgressData[] {
    return records
      .map(record => {
        if (!record.sets || record.sets.length === 0) {
          return null
        }
        
        const maxWeight = Math.max(...record.sets.map(set => set.weight))
        const totalReps = record.sets.reduce((sum, set) => sum + set.reps, 0)
        const volume = record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
        const avgWeight = record.sets.reduce((sum, set) => sum + set.weight, 0) / record.sets.length
        const avgReps = totalReps / record.sets.length
        
        return {
          date: record.date,
          weight: avgWeight,
          reps: avgReps,
          volume,
          maxWeight,
          totalReps
        }
      })
      .filter((data): data is ProgressData => data !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  /**
   * 筋肉部位別統計を計算
   */
  calculateMuscleGroupStats(records: TrainingRecord[], menus: TrainingMenu[]): MuscleGroupStats[] {
    const menuMap = new Map(menus.map(menu => [menu.id, menu]))
    const muscleGroupData = new Map<string, {
      sessions: number
      volume: number
      weights: number[]
      lastTrained: string
    }>()
    
    records.forEach(record => {
      const menu = menuMap.get(record.menuId)
      if (!menu || !record.sets || record.sets.length === 0) return
      
      // メニュー名から筋肉部位を推定（簡易版）
      const muscleGroup = this.inferMuscleGroup(menu.name)
      const volume = record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
      const weights = record.sets.map(set => set.weight)
      
      const current = muscleGroupData.get(muscleGroup) || {
        sessions: 0,
        volume: 0,
        weights: [],
        lastTrained: record.date
      }
      
      muscleGroupData.set(muscleGroup, {
        sessions: current.sessions + 1,
        volume: current.volume + volume,
        weights: [...current.weights, ...weights],
        lastTrained: record.date > current.lastTrained ? record.date : current.lastTrained
      })
    })
    
    return Array.from(muscleGroupData.entries())
      .map(([muscleGroup, data]) => ({
        muscleGroup,
        totalSessions: data.sessions,
        totalVolume: data.volume,
        averageWeight: data.weights.length > 0 
          ? data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length 
          : 0,
        lastTrained: data.lastTrained
      }))
      .sort((a, b) => b.totalSessions - a.totalSessions)
  }

  /**
   * 日付の週の月曜日を取得
   */
  private getMonday(date: Date): Date {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // 日曜日の場合は前週の月曜日
    return new Date(date.setDate(diff))
  }

  /**
   * メニュー名から筋肉部位を推定
   */
  private inferMuscleGroup(menuName: string): string {
    const name = menuName.toLowerCase()
    
    if (name.includes('ベンチ') || name.includes('プッシュ') || name.includes('胸')) {
      return '胸筋'
    } else if (name.includes('スクワット') || name.includes('脚') || name.includes('レッグ')) {
      return '脚'
    } else if (name.includes('デッド') || name.includes('背中') || name.includes('ロー')) {
      return '背中'
    } else if (name.includes('ショルダー') || name.includes('肩') || name.includes('プレス')) {
      return '肩'
    } else if (name.includes('カール') || name.includes('腕') || name.includes('上腕')) {
      return '腕'
    } else if (name.includes('腹筋') || name.includes('コア') || name.includes('クランチ')) {
      return '腹筋'
    } else {
      return 'その他'
    }
  }

  /**
   * 過去N日間のデータをフィルター
   */
  filterRecentRecords(records: TrainingRecord[], days: number): TrainingRecord[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return records.filter(record => new Date(record.date) >= cutoffDate)
  }

  /**
   * 日付範囲でデータをフィルター
   */
  filterRecordsByDateRange(
    records: TrainingRecord[], 
    startDate: string, 
    endDate: string
  ): TrainingRecord[] {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= start && recordDate <= end
    })
  }
}

export const analyticsService = new AnalyticsService()