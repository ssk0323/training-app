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

export interface UserCredentials {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
