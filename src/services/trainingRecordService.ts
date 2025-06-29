import type {
  TrainingRecord,
  CreateTrainingRecordInput,
  UpdateTrainingRecordInput,
} from '@/types'
import type { DatabaseAdapter } from '@/lib/database'
import { TrainingRecordDatabase } from './database/trainingRecordDatabase'

class TrainingRecordService {
  private database: TrainingRecordDatabase | null = null
  private records: TrainingRecord[] = []
  private currentUserId: string | null = null

  constructor() {
    // データベースが利用可能かチェック
    if (typeof window !== 'undefined' && 'D1Database' in window) {
      // データベースアダプターが必要なので、現在は使用しない
      // this.database = new TrainingRecordDatabase()
    }
  }

  // データベースを設定（Workers側用）
  setDatabase(db: DatabaseAdapter) {
    this.database = new TrainingRecordDatabase(db)
  }

  // ユーザーIDを設定
  setCurrentUser(userId: string) {
    this.currentUserId = userId
    this.loadUserRecords()
  }

  // ユーザー別の記録を読み込み
  private loadUserRecords() {
    if (!this.currentUserId) return

    const storageKey = `training_records_${this.currentUserId}`
    const savedRecords = localStorage.getItem(storageKey)
    if (savedRecords) {
      this.records = JSON.parse(savedRecords)
    } else {
      this.records = []
    }
  }

  // ユーザー別の記録を保存
  private saveUserRecords() {
    if (!this.currentUserId) return

    const storageKey = `training_records_${this.currentUserId}`
    localStorage.setItem(storageKey, JSON.stringify(this.records))
  }

  async create(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
    if (this.database) {
      return this.database.create(input)
    }

    // Fallback to in-memory implementation
    if (!input.menuId) {
      throw new Error('メニューIDは必須です')
    }

    if (!input.sets || input.sets.length === 0) {
      throw new Error('セット情報は必須です')
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    const record: TrainingRecord = {
      id,
      menuId: input.menuId,
      sets: input.sets.map(set => ({
        id: crypto.randomUUID(),
        ...set,
      })),
      comment: input.comment,
      date: input.date,
      createdAt: now,
      updatedAt: now,
    }

    this.records.push(record)
    this.saveUserRecords()
    return record
  }

  async update(input: UpdateTrainingRecordInput): Promise<TrainingRecord> {
    if (this.database) {
      return this.database.update(input)
    }

    // Fallback to in-memory implementation
    const recordIndex = this.records.findIndex(record => record.id === input.id)
    if (recordIndex === -1) {
      throw new Error('記録が見つかりません')
    }

    const now = new Date().toISOString()
    const updatedRecord: TrainingRecord = {
      ...this.records[recordIndex],
      sets: input.sets
        ? input.sets.map(set => ({
            id: crypto.randomUUID(),
            ...set,
          }))
        : this.records[recordIndex].sets,
      comment:
        input.comment !== undefined
          ? input.comment
          : this.records[recordIndex].comment,
      updatedAt: now,
    }

    this.records[recordIndex] = updatedRecord
    this.saveUserRecords()
    return updatedRecord
  }

  async getAll(): Promise<TrainingRecord[]> {
    if (this.database) {
      return this.database.getAll()
    }

    // Fallback to in-memory implementation
    return [...this.records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  async getById(id: string): Promise<TrainingRecord | null> {
    if (this.database) {
      return this.database.getById(id)
    }

    // Fallback to in-memory implementation
    return this.records.find(record => record.id === id) || null
  }

  async getByMenuId(menuId: string): Promise<TrainingRecord[]> {
    if (this.database) {
      return this.database.getByMenuId(menuId)
    }

    // Fallback to in-memory implementation
    return this.records
      .filter(record => record.menuId === menuId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async delete(id: string): Promise<void> {
    if (this.database) {
      return this.database.delete(id)
    }

    // Fallback to in-memory implementation
    const recordIndex = this.records.findIndex(record => record.id === id)
    if (recordIndex === -1) {
      throw new Error('記録が見つかりません')
    }

    this.records.splice(recordIndex, 1)
    this.saveUserRecords()
  }

  // ユーザーをクリア（ログアウト時）
  clearUser() {
    this.currentUserId = null
    this.records = []
  }
}

export const trainingRecordService = new TrainingRecordService()
