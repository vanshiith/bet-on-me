import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail, generateReminderEmail, generateDeadlineSoonEmail } from '@/lib/email'

/**
 * Cron endpoint to send reminder emails
 *
 * Schedule recommendations:
 * - Morning reminder: 9 AM (after people wake up)
 * - Afternoon reminder: 3 PM (mid-day check)
 * - Evening reminder: 2 hours before earliest bedtime (urgent)
 *
 * To set up with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/send-reminders",
 *       "schedule": "0 9,15,20 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const currentHour = new Date().getHours()

    // Determine if this is a final reminder (within 3 hours of common bedtimes)
    const isFinalReminder = currentHour >= 19

    // Get all users with their settings and pending habits
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, bedtime_hour, email_notifications_enabled')
      .eq('email_notifications_enabled', true)

    if (usersError || !users) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    let emailsSent = 0
    const results = []

    for (const user of users) {
      // Get active habits for this user
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('active', true)

      if (!habits || habits.length === 0) {
        continue
      }

      // Get today's occurrences
      const { data: occurrences } = await supabase
        .from('habit_occurrences')
        .select('habit_id, status')
        .eq('date', today)

      const completedHabitIds = new Set(
        occurrences?.filter(o => o.status === 'completed').map(o => o.habit_id) || []
      )

      const pendingHabits = habits.filter(h => !completedHabitIds.has(h.id))

      // Skip if no pending habits
      if (pendingHabits.length === 0) {
        continue
      }

      // Calculate hours until bedtime
      const bedtimeHour = user.bedtime_hour || 22
      const now = new Date()
      const bedtime = new Date()
      bedtime.setHours(bedtimeHour, 0, 0, 0)

      const hoursLeft = Math.max(0, Math.floor((bedtime.getTime() - now.getTime()) / (1000 * 60 * 60)))

      // Generate appropriate email
      const userName = user.email.split('@')[0]
      const pendingHabitNames = pendingHabits.map(h => h.name)

      const html = isFinalReminder
        ? generateDeadlineSoonEmail(userName, pendingHabitNames, hoursLeft)
        : generateReminderEmail(userName, pendingHabitNames)

      const subject = isFinalReminder
        ? `⚠️ ${hoursLeft}h left: Check in your habits!`
        : `🎯 Reminder: ${pendingHabits.length} habit${pendingHabits.length !== 1 ? 's' : ''} to check in`

      // Send email
      const result = await sendEmail({
        to: user.email,
        subject,
        html,
      })

      if (result.success) {
        emailsSent++
      }

      results.push({
        email: user.email,
        pendingCount: pendingHabits.length,
        sent: result.success,
      })
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      totalUsers: users.length,
      isFinalReminder,
      results,
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
