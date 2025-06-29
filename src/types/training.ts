export interface TrainingMenu {
  id: string
  name: string
  description: string
  scheduledDays: DayOfWeek[]
  createdAt: string
  updatedAt: string
}

export interface TrainingRecord {
  id: string
  menuId: string
  date: string
  sets: TrainingSet[]
  comment?: string
  createdAt: string
  updatedAt: string
}

export interface TrainingSet {
  id: string
  weight: number
  reps: number
  duration?: number
  restTime?: number
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface CreateTrainingMenuInput {
  name: string
  description: string
  scheduledDays: DayOfWeek[]
}

export interface UpdateTrainingMenuInput {
  name: string
  description: string
  scheduledDays: DayOfWeek[]
}

export interface CreateTrainingRecordInput {
  menuId: string
  date: string
  sets: Omit<TrainingSet, 'id'>[]
  comment?: string
}

export interface UpdateTrainingRecordInput {
  id: string
  sets?: Omit<TrainingSet, 'id'>[]
  comment?: string
}
