import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import HabitList from '@/components/HabitList'
import CreateHabitButton from '@/components/CreateHabitButton'

export default async function HabitsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="habits" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-3">My Habits</h2>
            <p className="text-lg text-slate-600">
              Create and manage your daily habits with financial accountability
            </p>
          </div>
          <CreateHabitButton />
        </div>

        <HabitList initialHabits={habits || []} />
      </main>
    </div>
  )
}
