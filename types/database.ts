export type OccurrenceStatus = 'pending' | 'completed' | 'missed'
export type PenaltyStatus = 'pending' | 'succeeded' | 'failed'

export interface User {
  id: string
  email: string
  timezone: string
  bedtime: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  stake_cents: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface HabitOccurrence {
  id: string
  habit_id: string
  date: string
  status: OccurrenceStatus
  checked_at: string | null
  created_at: string
  updated_at: string
}

export interface Penalty {
  id: string
  user_id: string
  date: string
  amount_cents: number
  status: PenaltyStatus
  details: {
    habit_id?: string
    occurrence_id?: string
    charity?: string
  } | null
  created_at: string
  updated_at: string
}
