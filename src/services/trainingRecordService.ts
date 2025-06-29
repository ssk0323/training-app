import type { TrainingRecord, CreateTrainingRecordInput, UpdateTrainingRecordInput } from '@/types'
import type { DatabaseAdapter } from '@/lib/database'
import { TrainingRecordDatabase } from './database/trainingRecordDatabase'

class TrainingRecordService {
  private database: TrainingRecordDatabase | null = null
  
  // Fallback in-memory storage
  private records: TrainingRecord[] = []

  setDatabase(db: DatabaseAdapter) {
    this.database = new TrainingRecordDatabase(db)
  }

  async create(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
    if (this.database) {
      return this.database.create(input)
    }

    // Fallback to in-memory implementation
    if (input.sets.length === 0) {
      throw new Error('セット数は1つ以上入力してください')
    }

    // Validate sets
    for (const set of input.sets) {
      if (set.weight <= 0) {
        throw new Error('重量は0より大きい値を入力してください')
      }
      if (set.reps <= 0) {
        throw new Error('回数は0より大きい値を入力してください')
      }
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    const record: TrainingRecord = {
      id,
      menuId: input.menuId,
      date: input.date,
      sets: input.sets.map((set) => ({
        id: crypto.randomUUID(),
        ...set,
      })),
      comment: input.comment,
      createdAt: now,
      updatedAt: now,
    }

    this.records.push(record)
    return record
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

  async getLatestByMenuId(menuId: string): Promise<TrainingRecord | null> {
    if (this.database) {
      return this.database.getLatestByMenuId(menuId)
    }

    // Fallback to in-memory implementation
    const records = await this.getByMenuId(menuId)
    return records[0] || null
  }

  async getAll(): Promise<TrainingRecord[]> {
    if (this.database) {
      return this.database.getAll()
    }

    // Fallback to in-memory implementation
    return [...this.records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async update(input: UpdateTrainingRecordInput): Promise<TrainingRecord> {
    const recordIndex = this.records.findIndex(r => r.id === input.id)
    if (recordIndex === -1) {
      throw new Error('記録が見つかりません')
    }

    const existingRecord = this.records[recordIndex]
    const updatedRecord: TrainingRecord = {
      ...existingRecord,
      sets: input.sets ? input.sets.map((set) => ({
        id: crypto.randomUUID(),
        ...set,
      })) : existingRecord.sets,
      comment: input.comment !== undefined ? input.comment : existingRecord.comment,
      updatedAt: new Date().toISOString(),
    }

    this.records[recordIndex] = updatedRecord
    return updatedRecord
  }

  async delete(id: string): Promise<void> {
    const recordIndex = this.records.findIndex(r => r.id === id)
    if (recordIndex === -1) {
      throw new Error('記録が見つかりません')
    }
    this.records.splice(recordIndex, 1)
  }
}

export const trainingRecordService = new TrainingRecordService()