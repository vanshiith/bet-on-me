import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import TodayHabitList from '@/components/TodayHabitList'

export default async function TodayPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get user's timezone and bedtime settings
  const { data: userData } = await supabase
    .from('users')
    .select('timezone, bedtime_hour')
    .eq('id', user.id)
    .single()

  // Get active habits for this user
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  // Get today's date in user's timezone (for now, using UTC)
  const today = new Date().toISOString().split('T')[0]

  // Get existing occurrences for today
  const { data: existingOccurrences } = await supabase
    .from('habit_occurrences')
    .select('*')
    .eq('date', today)

  // Auto-create occurrences for habits that don't have one yet
  if (habits && habits.length > 0) {
    const habitIdsWithOccurrences = new Set(
      existingOccurrences?.map(occ => occ.habit_id) || []
    )

    const habitsNeedingOccurrences = habits.filter(
      habit => !habitIdsWithOccurrences.has(habit.id)
    )

    if (habitsNeedingOccurrences.length > 0) {
      const newOccurrences = habitsNeedingOccurrences.map(habit => ({
        habit_id: habit.id,
        date: today,
        status: 'pending' as const,
      }))

      await supabase
        .from('habit_occurrences')
        .insert(newOccurrences)
    }
  }

  // Re-fetch all occurrences after creation
  const { data: todayOccurrences } = await supabase
    .from('habit_occurrences')
    .select(`
      *,
      habits (*)
    `)
    .eq('date', today)
    .order('created_at', { ascending: false })

  // Calculate deadline time
  const bedtimeHour = userData?.bedtime_hour || 22 // Default to 10 PM
  const deadlineTime = new Date()
  deadlineTime.setHours(bedtimeHour, 0, 0, 0)
  const isPastDeadline = new Date() > deadlineTime

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="today" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-3">Today's Check-in</h2>
          <p className="text-lg text-slate-600">
            Mark your habits before <span className="font-semibold text-indigo-600">{bedtimeHour > 12 ? bedtimeHour - 12 : bedtimeHour}:00 {bedtimeHour >= 12 ? 'PM' : 'AM'}</span>
          </p>
          {isPastDeadline && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-md animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <p className="text-sm text-red-800 font-semibold">
                  Past today's deadline. Any pending habits will be marked as missed.
                </p>
              </div>
            </div>
          )}
        </div>

        <TodayHabitList
          occurrences={todayOccurrences || []}
          isPastDeadline={isPastDeadline}
        />
      </main>
    </div>
  )
}
