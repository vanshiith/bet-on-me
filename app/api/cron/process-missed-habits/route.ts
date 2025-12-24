import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Cron endpoint to process all pending habit occurrences past deadline
 * This should be called daily after the latest possible bedtime (e.g., 3 AM)
 *
 * To set up with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-missed-habits",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get yesterday's date (since this runs after midnight)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split('T')[0]

    // Get all pending occurrences from yesterday
    const { data: pendingOccurrences, error: fetchError } = await supabase
      .from('habit_occurrences')
      .select(`
        *,
        habits (
          id,
          stake_cents,
          user_id
        )
      `)
      .eq('date', yesterdayDate)
      .eq('status', 'pending')

    if (fetchError) {
      console.error('Error fetching pending occurrences:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch occurrences' }, { status: 500 })
    }

    if (!pendingOccurrences || pendingOccurrences.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending occurrences to process'
      })
    }

    // Mark all as missed
    const occurrenceIds = pendingOccurrences.map(occ => occ.id)

    const { error: updateError } = await supabase
      .from('habit_occurrences')
      .update({
        status: 'missed',
        checked_at: new Date().toISOString()
      })
      .in('id', occurrenceIds)

    if (updateError) {
      console.error('Error updating occurrences:', updateError)
      return NextResponse.json({ error: 'Failed to update occurrences' }, { status: 500 })
    }

    // Create penalties for each missed habit
    const penalties = pendingOccurrences.map(occ => ({
      user_id: occ.habits.user_id,
      habit_id: occ.habit_id,
      occurrence_id: occ.id,
      amount_cents: occ.habits.stake_cents,
      status: 'pending' as const,
    }))

    const { error: penaltyError } = await supabase
      .from('penalties')
      .insert(penalties)

    if (penaltyError) {
      console.error('Error creating penalties:', penaltyError)
      return NextResponse.json({ error: 'Failed to create penalties' }, { status: 500 })
    }

    const totalAmount = pendingOccurrences.reduce((sum, occ) => sum + occ.habits.stake_cents, 0)

    return NextResponse.json({
      success: true,
      processed: pendingOccurrences.length,
      totalAmount,
      date: yesterdayDate,
      message: `Processed ${pendingOccurrences.length} missed habits`
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
