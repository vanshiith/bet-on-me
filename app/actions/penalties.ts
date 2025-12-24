'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Process all pending habit occurrences that are past deadline
 * and create penalties for missed ones
 */
export async function processMissedHabits() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get user's bedtime setting
  const { data: userData } = await supabase
    .from('users')
    .select('bedtime_hour')
    .eq('id', user.id)
    .single()

  const bedtimeHour = userData?.bedtime_hour || 22

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Check if we're past bedtime
  const now = new Date()
  const deadlineTime = new Date()
  deadlineTime.setHours(bedtimeHour, 0, 0, 0)

  if (now <= deadlineTime) {
    return { error: 'Not past deadline yet' }
  }

  // Get all pending occurrences for today
  const { data: pendingOccurrences } = await supabase
    .from('habit_occurrences')
    .select(`
      *,
      habits (
        id,
        stake_cents,
        user_id
      )
    `)
    .eq('date', today)
    .eq('status', 'pending')

  if (!pendingOccurrences || pendingOccurrences.length === 0) {
    return { success: true, processed: 0 }
  }

  // Filter only user's occurrences
  const userOccurrences = pendingOccurrences.filter(
    occ => occ.habits.user_id === user.id
  )

  if (userOccurrences.length === 0) {
    return { success: true, processed: 0 }
  }

  // Mark all as missed
  const occurrenceIds = userOccurrences.map(occ => occ.id)

  const { error: updateError } = await supabase
    .from('habit_occurrences')
    .update({
      status: 'missed',
      checked_at: new Date().toISOString()
    })
    .in('id', occurrenceIds)

  if (updateError) {
    return { error: 'Failed to update occurrences' }
  }

  // Create penalties for each missed habit
  const penalties = userOccurrences.map(occ => ({
    user_id: user.id,
    habit_id: occ.habit_id,
    occurrence_id: occ.id,
    amount_cents: occ.habits.stake_cents,
    status: 'pending' as const,
  }))

  const { error: penaltyError } = await supabase
    .from('penalties')
    .insert(penalties)

  if (penaltyError) {
    return { error: 'Failed to create penalties' }
  }

  return {
    success: true,
    processed: userOccurrences.length,
    totalAmount: userOccurrences.reduce((sum, occ) => sum + occ.habits.stake_cents, 0)
  }
}

/**
 * Manually mark a habit as missed and create penalty
 */
export async function createPenaltyForOccurrence(occurrenceId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get the occurrence with habit details
  const { data: occurrence } = await supabase
    .from('habit_occurrences')
    .select(`
      *,
      habits (
        id,
        stake_cents,
        user_id
      )
    `)
    .eq('id', occurrenceId)
    .single()

  if (!occurrence || occurrence.habits.user_id !== user.id) {
    return { error: 'Occurrence not found' }
  }

  if (occurrence.status !== 'missed') {
    return { error: 'Only missed habits incur penalties' }
  }

  // Check if penalty already exists
  const { data: existingPenalty } = await supabase
    .from('penalties')
    .select('id')
    .eq('occurrence_id', occurrenceId)
    .single()

  if (existingPenalty) {
    return { error: 'Penalty already exists for this occurrence' }
  }

  // Create penalty
  const { error: penaltyError } = await supabase
    .from('penalties')
    .insert({
      user_id: user.id,
      habit_id: occurrence.habit_id,
      occurrence_id: occurrenceId,
      amount_cents: occurrence.habits.stake_cents,
      status: 'pending',
    })

  if (penaltyError) {
    return { error: 'Failed to create penalty' }
  }

  return { success: true }
}

/**
 * Get total penalties for the current user
 */
export async function getTotalPenalties() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', total: 0 }
  }

  const { data: penalties } = await supabase
    .from('penalties')
    .select('amount_cents')
    .eq('user_id', user.id)

  const total = penalties?.reduce((sum, p) => sum + p.amount_cents, 0) || 0

  return { success: true, total }
}
