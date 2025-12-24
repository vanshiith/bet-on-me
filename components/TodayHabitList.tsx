'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Habit {
  id: string
  name: string
  stake_cents: number
}

interface HabitOccurrence {
  id: string
  habit_id: string
  date: string
  status: 'pending' | 'completed' | 'missed'
  habits: Habit
}

interface TodayHabitListProps {
  occurrences: HabitOccurrence[]
  isPastDeadline: boolean
}

export default function TodayHabitList({ occurrences, isPastDeadline }: TodayHabitListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCheckIn = async (occurrenceId: string, status: 'completed' | 'missed', occurrence: HabitOccurrence) => {
    setLoading(occurrenceId)

    const { error } = await supabase
      .from('habit_occurrences')
      .update({
        status,
        checked_at: new Date().toISOString()
      })
      .eq('id', occurrenceId)

    if (!error && status === 'missed') {
      // Create penalty for missed habit
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('penalties')
          .insert({
            user_id: user.id,
            habit_id: occurrence.habit_id,
            occurrence_id: occurrenceId,
            amount_cents: occurrence.habits.stake_cents,
            status: 'pending',
          })
      }
    }

    if (!error) {
      router.refresh()
    }
    setLoading(null)
  }

  if (occurrences.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-16 text-center animate-fade-in">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-6xl">📅</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-slate-900 mb-4">
            No active habits for today
          </h3>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Create some habits first to start tracking your daily progress!
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
            <span>Go to Habits to create your first habit</span>
            <span>→</span>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = occurrences.filter(occ => occ.status === 'pending').length
  const completedCount = occurrences.filter(occ => occ.status === 'completed').length
  const missedCount = occurrences.filter(occ => occ.status === 'missed').length

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-in">
        <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Pending</p>
              <p className="text-5xl font-display font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
              ⏳
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Completed</p>
              <p className="text-5xl font-display font-bold text-emerald-600">{completedCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
              ✓
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Missed</p>
              <p className="text-5xl font-display font-bold text-red-600">{missedCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
              ✗
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 animate-fade-in">
        {occurrences.map((occurrence) => {
          const isLoading = loading === occurrence.id
          const isDisabled = isPastDeadline && occurrence.status === 'pending'
          const canCheckIn = occurrence.status === 'pending' && !isPastDeadline

          return (
            <div
              key={occurrence.id}
              className={`group bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 ${
                occurrence.status === 'completed' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-emerald-200' :
                occurrence.status === 'missed' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:shadow-red-200' :
                'border-slate-200 hover:shadow-2xl hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-4 truncate">
                    {occurrence.habits.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-xl font-medium shadow-sm">
                      <span className="text-lg">💰</span>
                      <span className="font-bold text-indigo-600">${(occurrence.habits.stake_cents / 100).toFixed(2)}</span>
                      <span>at stake</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm ${
                      occurrence.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      occurrence.status === 'missed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {occurrence.status === 'completed' ? '✓ Completed' :
                       occurrence.status === 'missed' ? '✗ Missed' :
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {canCheckIn && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCheckIn(occurrence.id, 'completed', occurrence)}
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      aria-label={`Mark ${occurrence.habits.name} as completed`}
                    >
                      {isLoading ? 'Saving...' : '✓ Done'}
                    </button>
                    <button
                      onClick={() => handleCheckIn(occurrence.id, 'missed', occurrence)}
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      aria-label={`Mark ${occurrence.habits.name} as missed`}
                    >
                      {isLoading ? 'Saving...' : '✗ Missed'}
                    </button>
                  </div>
                )}

                {isDisabled && (
                  <div className="px-5 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl shadow-sm">
                    Deadline passed
                  </div>
                )}

                {occurrence.status !== 'pending' && (
                  <div className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl shadow-sm">
                    {occurrence.status === 'completed' ? '🎉 Great job!' : '💪 Better luck tomorrow'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
