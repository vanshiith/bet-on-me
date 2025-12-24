import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { calculateCurrentStreak } from '@/lib/streaks'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)

  const habitCount = habits?.length || 0

  // Get today's occurrences for progress
  const today = new Date().toISOString().split('T')[0]
  const { data: todayOccurrences } = await supabase
    .from('habit_occurrences')
    .select('status')
    .eq('date', today)

  const completedToday = todayOccurrences?.filter(occ => occ.status === 'completed').length || 0
  const totalToday = todayOccurrences?.length || 0

  // Get total penalties
  const { data: penalties } = await supabase
    .from('penalties')
    .select('amount_cents')
    .eq('user_id', user.id)

  const totalPenalties = penalties?.reduce((sum, p) => sum + p.amount_cents, 0) || 0

  // Get all occurrences for streak calculation
  const { data: allOccurrences } = await supabase
    .from('habit_occurrences')
    .select('date, status')
    .order('date', { ascending: false })

  const currentStreak = calculateCurrentStreak(allOccurrences || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-3">
            Welcome back!
          </h2>
          <p className="text-lg text-slate-600">
            {user.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-in">
          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Active Habits</p>
                <p className="text-5xl font-display font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{habitCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                🎯
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Today's Progress</p>
                <p className="text-5xl font-display font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {totalToday > 0 ? `${completedToday}/${totalToday}` : '-'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                ✓
              </div>
            </div>
            {totalToday > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-700 font-medium">
                  {completedToday === totalToday ? '🎉 Perfect day!' : `${totalToday - completedToday} remaining`}
                </p>
              </div>
            )}
          </div>

          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Current Streak</p>
                <p className="text-5xl font-display font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">{currentStreak}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                🔥
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-700 font-medium">
                {currentStreak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Total Donated</p>
                <p className="text-5xl font-display font-bold bg-gradient-to-br from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  ${(totalPenalties / 100).toFixed(2)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                💰
              </div>
            </div>
            {penalties && penalties.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-700 font-medium">
                  {penalties.length} missed habit{penalties.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-1 shadow-xl animate-fade-in">
          <div className="bg-white rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="text-xl font-display font-bold text-slate-900 mb-2">You're all set!</p>
                <p className="text-slate-700 leading-relaxed">
                  Track your progress, build streaks, and stay accountable with financial stakes.
                  Visit <span className="font-semibold text-indigo-600">Analytics</span> for detailed insights and achievement badges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
