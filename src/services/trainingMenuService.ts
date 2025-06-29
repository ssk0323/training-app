import type { TrainingMenu, CreateTrainingMenuInput } from '@/types'
import type { DatabaseAdapter } from '@/lib/database'
import { TrainingMenuDatabase } from './database/trainingMenuDatabase'

class TrainingMenuService {
  private database: TrainingMenuDatabase | null = null

  // Fallback in-memory storage
  private menus: TrainingMenu[] = []

  setDatabase(db: DatabaseAdapter) {
    this.database = new TrainingMenuDatabase(db)
  }

  async create(input: CreateTrainingMenuInput): Promise<TrainingMenu> {
    if (this.database) {
      return this.database.create(input)
    }

    // Fallback to in-memory implementation
    if (!input.name.trim()) {
      throw new Error('メニュー名は必須です')
    }

    if (input.scheduledDays.length === 0) {
      throw new Error('実施予定日は1日以上選択してください')
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    const menu: TrainingMenu = {
      id,
      name: input.name,
      description: input.description,
      scheduledDays: input.scheduledDays,
      createdAt: now,
      updatedAt: now,
    }

    this.menus.push(menu)
    return menu
  }

  async getAll(): Promise<TrainingMenu[]> {
    if (this.database) {
      return this.database.getAll()
    }

    // Fallback to in-memory implementation
    return [...this.menus]
  }

  async getById(id: string): Promise<TrainingMenu | null> {
    if (this.database) {
      return this.database.getById(id)
    }

    // Fallback to in-memory implementation
    return this.menus.find(menu => menu.id === id) || null
  }
}

export const trainingMenuService = new TrainingMenuService()