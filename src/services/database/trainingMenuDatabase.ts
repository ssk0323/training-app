import type { DatabaseAdapter } from '@/lib/database'
import type { TrainingMenu, CreateTrainingMenuInput, DayOfWeek } from '@/types'

interface TrainingMenuRow {
  id: string
  name: string
  description: string | null
  scheduled_days: string // JSON string
  created_at: string
  updated_at: string
}

export class TrainingMenuDatabase {
  constructor(private db: DatabaseAdapter) {}

  private mapRowToMenu(row: TrainingMenuRow): TrainingMenu {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      scheduledDays: JSON.parse(row.scheduled_days) as DayOfWeek[],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  async create(input: CreateTrainingMenuInput): Promise<TrainingMenu> {
    if (!input.name.trim()) {
      throw new Error('メニュー名は必須です')
    }

    if (input.scheduledDays.length === 0) {
      throw new Error('実施予定日は1日以上選択してください')
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    const sql = `
      INSERT INTO training_menus (id, name, description, scheduled_days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const params = [
      id,
      input.name.trim(),
      input.description.trim() || null,
      JSON.stringify(input.scheduledDays),
      now,
      now,
    ]

    const result = await this.db.run(sql, params)
    
    if (!result.success) {
      throw new Error('メニューの作成に失敗しました')
    }

    return {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      scheduledDays: input.scheduledDays,
      createdAt: now,
      updatedAt: now,
    }
  }

  async getAll(): Promise<TrainingMenu[]> {
    const sql = 'SELECT * FROM training_menus ORDER BY created_at DESC'
    const rows = await this.db.query<TrainingMenuRow>(sql)
    return rows.map(row => this.mapRowToMenu(row))
  }

  async getById(id: string): Promise<TrainingMenu | null> {
    const sql = 'SELECT * FROM training_menus WHERE id = ?'
    const row = await this.db.first<TrainingMenuRow>(sql, [id])
    return row ? this.mapRowToMenu(row) : null
  }

  async update(id: string, input: Partial<CreateTrainingMenuInput>): Promise<TrainingMenu> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('メニューが見つかりません')
    }

    const now = new Date().toISOString()
    const updates: string[] = []
    const params: unknown[] = []

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new Error('メニュー名は必須です')
      }
      updates.push('name = ?')
      params.push(input.name.trim())
    }

    if (input.description !== undefined) {
      updates.push('description = ?')
      params.push(input.description.trim() || null)
    }

    if (input.scheduledDays !== undefined) {
      if (input.scheduledDays.length === 0) {
        throw new Error('実施予定日は1日以上選択してください')
      }
      updates.push('scheduled_days = ?')
      params.push(JSON.stringify(input.scheduledDays))
    }

    if (updates.length === 0) {
      return existing
    }

    updates.push('updated_at = ?')
    params.push(now, id)

    const sql = `UPDATE training_menus SET ${updates.join(', ')} WHERE id = ?`
    
    const result = await this.db.run(sql, params)
    if (!result.success) {
      throw new Error('メニューの更新に失敗しました')
    }

    const updated = await this.getById(id)
    if (!updated) {
      throw new Error('更新されたメニューの取得に失敗しました')
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM training_menus WHERE id = ?'
    const result = await this.db.run(sql, [id])
    
    if (!result.success) {
      throw new Error('メニューの削除に失敗しました')
    }
  }

  async getByScheduledDay(day: DayOfWeek): Promise<TrainingMenu[]> {
    const sql = 'SELECT * FROM training_menus ORDER BY created_at DESC'
    const rows = await this.db.query<TrainingMenuRow>(sql)
    
    return rows
      .map(row => this.mapRowToMenu(row))
      .filter(menu => menu.scheduledDays.includes(day))
  }
}