import type {
  TrainingMenu,
  CreateTrainingMenuInput,
  UpdateTrainingMenuInput,
} from '@/types'
import type { DatabaseAdapter } from '@/lib/database'
import { TrainingMenuDatabase } from './database/trainingMenuDatabase'

class TrainingMenuService {
  private database: TrainingMenuDatabase | null = null
  private menus: TrainingMenu[] = []
  private currentUserId: string | null = null

  constructor() {
    // データベースが利用可能かチェック
    if (typeof window !== 'undefined' && 'D1Database' in window) {
      // データベースアダプターが必要なので、現在は使用しない
      // this.database = new TrainingMenuDatabase()
    }
  }

  // データベースを設定（Workers側用）
  setDatabase(db: DatabaseAdapter) {
    this.database = new TrainingMenuDatabase(db)
  }

  // ユーザーIDを設定
  setCurrentUser(userId: string) {
    this.currentUserId = userId
    this.loadUserMenus()
  }

  // ユーザー別のメニューを読み込み
  private loadUserMenus() {
    if (!this.currentUserId) return

    const storageKey = `training_menus_${this.currentUserId}`
    const savedMenus = localStorage.getItem(storageKey)
    if (savedMenus) {
      this.menus = JSON.parse(savedMenus)
    } else {
      this.menus = []
    }
  }

  // ユーザー別のメニューを保存
  private saveUserMenus() {
    if (!this.currentUserId) return

    const storageKey = `training_menus_${this.currentUserId}`
    localStorage.setItem(storageKey, JSON.stringify(this.menus))
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
    this.saveUserMenus()
    return menu
  }

  async update(
    id: string,
    input: UpdateTrainingMenuInput
  ): Promise<TrainingMenu> {
    if (this.database) {
      return this.database.update(id, input)
    }

    // Fallback to in-memory implementation
    const menuIndex = this.menus.findIndex(menu => menu.id === id)
    if (menuIndex === -1) {
      throw new Error('メニューが見つかりません')
    }

    if (!input.name.trim()) {
      throw new Error('メニュー名は必須です')
    }

    if (input.scheduledDays.length === 0) {
      throw new Error('実施予定日は1日以上選択してください')
    }

    const now = new Date().toISOString()
    const updatedMenu: TrainingMenu = {
      ...this.menus[menuIndex],
      name: input.name,
      description: input.description,
      scheduledDays: input.scheduledDays,
      updatedAt: now,
    }

    this.menus[menuIndex] = updatedMenu
    this.saveUserMenus()
    return updatedMenu
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

  async delete(id: string): Promise<void> {
    if (this.database) {
      return this.database.delete(id)
    }

    // Fallback to in-memory implementation
    const menuIndex = this.menus.findIndex(menu => menu.id === id)
    if (menuIndex === -1) {
      throw new Error('メニューが見つかりません')
    }

    this.menus.splice(menuIndex, 1)
    this.saveUserMenus()
  }

  // ユーザーをクリア（ログアウト時）
  clearUser() {
    this.currentUserId = null
    this.menus = []
  }
}

export const trainingMenuService = new TrainingMenuService()
