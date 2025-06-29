export interface Env {
  DB: D1Database
  JWT_SECRET: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}
