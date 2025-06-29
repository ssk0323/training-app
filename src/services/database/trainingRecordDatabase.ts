import type { DatabaseAdapter } from '@/lib/database'
import type { TrainingRecord, CreateTrainingRecordInput, UpdateTrainingRecordInput, TrainingSet } from '@/types'

interface TrainingRecordRow {
  id: string
  menu_id: string
  date: string
  comment: string | null
  created_at: string
  updated_at: string
}

interface TrainingSetRow {
  id: string
  record_id: string
  weight: number
  reps: number
  duration: number | null
  rest_time: number | null
  set_order: number
}

export class TrainingRecordDatabase {
  constructor(private db: DatabaseAdapter) {}

  private async mapRowToRecord(row: TrainingRecordRow): Promise<TrainingRecord> {
    const sets = await this.getSetsByRecordId(row.id)
    
    return {
      id: row.id,
      menuId: row.menu_id,
      date: row.date,
      sets,
      comment: row.comment || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private async getSetsByRecordId(recordId: string): Promise<TrainingSet[]> {
    const sql = 'SELECT * FROM training_sets WHERE record_id = ? ORDER BY set_order'
    const rows = await this.db.query<TrainingSetRow>(sql, [recordId])
    
    return rows.map(row => ({
      id: row.id,
      weight: row.weight,
      reps: row.reps,
      duration: row.duration || undefined,
      restTime: row.rest_time || undefined,
    }))
  }

  async create(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
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
    const recordId = crypto.randomUUID()

    // Create record and sets in a transaction
    const statements = []

    // Insert training record
    statements.push({
      sql: `INSERT INTO training_records (id, menu_id, date, comment, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [recordId, input.menuId, input.date, input.comment || null, now, now],
    })

    // Insert training sets
    input.sets.forEach((set, index) => {
      const setId = crypto.randomUUID()
      statements.push({
        sql: `INSERT INTO training_sets (id, record_id, weight, reps, duration, rest_time, set_order) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          setId,
          recordId,
          set.weight,
          set.reps,
          set.duration || null,
          set.restTime || null,
          index + 1,
        ],
      })
    })

    const results = await this.db.batch(statements)
    
    if (!results.every(result => result.success)) {
      throw new Error('記録の作成に失敗しました')
    }

    const created = await this.getById(recordId)
    if (!created) {
      throw new Error('作成された記録の取得に失敗しました')
    }

    return created
  }

  async getById(id: string): Promise<TrainingRecord | null> {
    const sql = 'SELECT * FROM training_records WHERE id = ?'
    const row = await this.db.first<TrainingRecordRow>(sql, [id])
    return row ? this.mapRowToRecord(row) : null
  }

  async getByMenuId(menuId: string): Promise<TrainingRecord[]> {
    const sql = 'SELECT * FROM training_records WHERE menu_id = ? ORDER BY date DESC'
    const rows = await this.db.query<TrainingRecordRow>(sql, [menuId])
    
    const records = []
    for (const row of rows) {
      records.push(await this.mapRowToRecord(row))
    }
    return records
  }

  async getLatestByMenuId(menuId: string): Promise<TrainingRecord | null> {
    const sql = 'SELECT * FROM training_records WHERE menu_id = ? ORDER BY date DESC LIMIT 1'
    const row = await this.db.first<TrainingRecordRow>(sql, [menuId])
    return row ? this.mapRowToRecord(row) : null
  }

  async getAll(): Promise<TrainingRecord[]> {
    const sql = 'SELECT * FROM training_records ORDER BY date DESC'
    const rows = await this.db.query<TrainingRecordRow>(sql)
    
    const records = []
    for (const row of rows) {
      records.push(await this.mapRowToRecord(row))
    }
    return records
  }

  async update(input: UpdateTrainingRecordInput): Promise<TrainingRecord> {
    const existing = await this.getById(input.id)
    if (!existing) {
      throw new Error('記録が見つかりません')
    }

    const now = new Date().toISOString()
    const statements = []

    // Update record
    const recordUpdates = ['updated_at = ?']
    const recordParams = [now]

    if (input.comment !== undefined) {
      recordUpdates.push('comment = ?')
      recordParams.push(input.comment ?? null)
    }

    recordParams.push(input.id)

    statements.push({
      sql: `UPDATE training_records SET ${recordUpdates.join(', ')} WHERE id = ?`,
      params: recordParams,
    })

    // Update sets if provided
    if (input.sets) {
      // Delete existing sets
      statements.push({
        sql: 'DELETE FROM training_sets WHERE record_id = ?',
        params: [input.id],
      })

      // Insert new sets
      input.sets.forEach((set, index) => {
        const setId = crypto.randomUUID()
        statements.push({
          sql: `INSERT INTO training_sets (id, record_id, weight, reps, duration, rest_time, set_order) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          params: [
            setId,
            input.id,
            set.weight,
            set.reps,
            set.duration || null,
            set.restTime || null,
            index + 1,
          ],
        })
      })
    }

    const results = await this.db.batch(statements)
    
    if (!results.every(result => result.success)) {
      throw new Error('記録の更新に失敗しました')
    }

    const updated = await this.getById(input.id)
    if (!updated) {
      throw new Error('更新された記録の取得に失敗しました')
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    // Sets will be deleted automatically due to CASCADE
    const sql = 'DELETE FROM training_records WHERE id = ?'
    const result = await this.db.run(sql, [id])
    
    if (!result.success) {
      throw new Error('記録の削除に失敗しました')
    }
  }
}