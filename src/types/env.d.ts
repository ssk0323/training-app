/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JWT_SECRET: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_WARNING_TIME: string
  readonly VITE_USE_API: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Cloudflare D1 types
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
    exec(query: string): Promise<D1ExecResult>
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement
    first(): Promise<unknown>
    run(): Promise<D1Result>
    all(): Promise<D1Result>
  }

  interface D1Result {
    results?: unknown[]
    success: boolean
    meta: {
      changes: number
      last_row_id: number
      duration: number
    }
  }

  interface D1ExecResult {
    results: D1Result[]
    success: boolean
    meta: {
      duration: number
    }
  }
}
