import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AnalyticsView from '@/components/AnalyticsView'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get all habits with their occurrences
  const { data: habits } = await supabase
    .from('habits')
    .select(`
      *,
      habit_occurrences (
        id,
        date,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="analytics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-3">Analytics & Insights</h2>
          <p className="text-lg text-slate-600">
            Track your progress, streaks, and completion rates over time
          </p>
        </div>

        <AnalyticsView habits={habits || []} />
      </main>
    </div>
  )
}
