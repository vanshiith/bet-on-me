import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import PenaltiesList from '@/components/PenaltiesList'

export default async function PenaltiesPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get all penalties with habit and occurrence details
  const { data: penalties } = await supabase
    .from('penalties')
    .select(`
      *,
      habits (
        id,
        name
      ),
      habit_occurrences (
        id,
        date,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate total
  const totalCents = penalties?.reduce((sum, p) => sum + p.amount_cents, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentPath="penalties" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-display font-bold text-slate-900 mb-3">Penalty History</h2>
          <p className="text-lg text-slate-600">
            Track your accountability journey and see where your commitment has wavered
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-10 mb-8 animate-slide-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Total Donated</p>
              <p className="text-6xl font-display font-bold bg-gradient-to-br from-pink-600 to-purple-600 bg-clip-text text-transparent">
                ${(totalCents / 100).toFixed(2)}
              </p>
              <p className="text-base text-slate-700 mt-4 font-medium">
                {penalties?.length || 0} missed habit{penalties?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-5xl shadow-xl">
              💰
            </div>
          </div>
        </div>

        <PenaltiesList penalties={penalties || []} />
      </main>
    </div>
  )
}
