// Database interface for D1 operations
export interface DatabaseAdapter {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  first<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>
  run(sql: string, params?: unknown[]): Promise<{ success: boolean; meta: any }>
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<{ success: boolean; meta: any }[]>
}

// D1 Database adapter for Cloudflare Workers
export class D1DatabaseAdapter implements DatabaseAdapter {
  constructor(private db: any) {} // Using any for D1Database to avoid type issues

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.db.prepare(sql).bind(...(params || [])).all()
    return result.results as T[]
  }

  async first<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.db.prepare(sql).bind(...(params || [])).first()
    return (result as T) || null
  }

  async run(sql: string, params?: unknown[]): Promise<{ success: boolean; meta: any }> {
    const result = await this.db.prepare(sql).bind(...(params || [])).run()
    return { success: result.success, meta: result.meta }
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<{ success: boolean; meta: any }[]> {
    const preparedStatements = statements.map(stmt => 
      this.db.prepare(stmt.sql).bind(...(stmt.params || []))
    )
    const results = await this.db.batch(preparedStatements)
    return results.map((result: any) => ({ success: result.success, meta: result.meta }))
  }
}

// Mock database adapter for testing
export class MockDatabaseAdapter implements DatabaseAdapter {
  private data: Record<string, any[]> = {
    training_menus: [],
    training_records: [],
    training_sets: [],
  }

  async query<T = unknown>(sql: string, _params?: unknown[]): Promise<T[]> {
    // Simple mock implementation for testing
    if (sql.includes('SELECT * FROM training_menus')) {
      return this.data.training_menus as T[]
    }
    if (sql.includes('SELECT * FROM training_records')) {
      return this.data.training_records as T[]
    }
    if (sql.includes('SELECT * FROM training_sets')) {
      return this.data.training_sets as T[]
    }
    return []
  }

  async first<T = unknown>(_sql: string, _params?: unknown[]): Promise<T | null> {
    const results = await this.query<T>(_sql, _params)
    return results[0] || null
  }

  async run(_sql: string, _params?: unknown[]): Promise<{ success: boolean; meta: any }> {
    // Mock implementation for INSERT/UPDATE/DELETE
    return { success: true, meta: { changes: 1, last_row_id: Date.now() } }
  }

  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<{ success: boolean; meta: any }[]> {
    const results = []
    for (const stmt of statements) {
      results.push(await this.run(stmt.sql, stmt.params))
    }
    return results
  }

  // Helper methods for testing
  setData(table: string, data: any[]) {
    this.data[table] = data
  }

  getData(table: string) {
    return this.data[table] || []
  }

  clearAll() {
    this.data = {
      training_menus: [],
      training_records: [],
      training_sets: [],
    }
  }
}