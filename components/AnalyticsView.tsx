'use client'

import { useState } from 'react'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  getWeeklyStats,
  getMonthlyStats
} from '@/lib/streaks'

interface Occurrence {
  id: string
  date: string
  status: 'pending' | 'completed' | 'missed'
}

interface Habit {
  id: string
  name: string
  active: boolean
  created_at: string
  habit_occurrences: Occurrence[]
}

interface AnalyticsViewProps {
  habits: Habit[]
}

export default function AnalyticsView({ habits }: AnalyticsViewProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>('all')

  // Filter habits and occurrences
  const activeHabits = habits.filter(h => h.active)
  const selectedHabit = selectedHabitId === 'all'
    ? null
    : habits.find(h => h.id === selectedHabitId)

  const allOccurrences = selectedHabitId === 'all'
    ? habits.flatMap(h => h.habit_occurrences)
    : selectedHabit?.habit_occurrences || []

  // Calculate stats
  const currentStreak = calculateCurrentStreak(allOccurrences)
  const longestStreak = calculateLongestStreak(allOccurrences)
  const completionRate = calculateCompletionRate(allOccurrences)
  const weeklyStats = getWeeklyStats(allOccurrences, 4)
  const monthlyStats = getMonthlyStats(allOccurrences, 6)

  // Calculate totals
  const totalCompleted = allOccurrences.filter(o => o.status === 'completed').length
  const totalMissed = allOccurrences.filter(o => o.status === 'missed').length

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-black mb-3">
            No Data Yet
          </h3>
          <p className="text-black leading-relaxed">
            Create some habits and start tracking to see your analytics and progress!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Habit Selector */}
      {activeHabits.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label htmlFor="habit-select" className="block text-sm font-medium text-black mb-2">
            Filter by Habit
          </label>
          <select
            id="habit-select"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Habits</option>
            {activeHabits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-black">Current Streak</p>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-black">{currentStreak}</p>
          <p className="text-xs text-black mt-1">
            {currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-black">Longest Streak</p>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-black">{longestStreak}</p>
          <p className="text-xs text-black mt-1">
            {longestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-black">Completion Rate</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-3xl font-bold text-black">{completionRate}%</p>
          <p className="text-xs text-black mt-1">
            {totalCompleted} / {allOccurrences.length} total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-black">Total Missed</p>
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{totalMissed}</p>
          <p className="text-xs text-black mt-1">
            {totalMissed === 1 ? 'occurrence' : 'occurrences'}
          </p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Weekly Progress (Last 4 Weeks)</h3>
        <div className="space-y-3">
          {weeklyStats.map((week, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-black font-medium">
                  {new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(week.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-black">
                  {week.completed}/{week.total} ({week.rate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    week.rate >= 80 ? 'bg-green-500' :
                    week.rate >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${week.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Monthly Trends (Last 6 Months)</h3>
        <div className="grid gap-3 md:grid-cols-6">
          {monthlyStats.map((month, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs font-medium text-black mb-2">
                {month.month}
              </div>
              <div className="h-32 flex items-end justify-center">
                <div
                  className={`w-12 rounded-t transition-all ${
                    month.rate >= 80 ? 'bg-green-500' :
                    month.rate >= 50 ? 'bg-yellow-500' :
                    month.rate > 0 ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}
                  style={{ height: `${month.total > 0 ? month.rate : 5}%` }}
                />
              </div>
              <div className="text-xs text-black mt-2">
                {month.rate}%
              </div>
              <div className="text-xs text-black">
                {month.completed}/{month.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Achievements</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {currentStreak >= 7 && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="font-semibold text-black">Week Warrior</p>
                <p className="text-xs text-black">7+ day streak</p>
              </div>
            </div>
          )}
          {currentStreak >= 30 && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-3xl">👑</span>
              <div>
                <p className="font-semibold text-black">Month Master</p>
                <p className="text-xs text-black">30+ day streak</p>
              </div>
            </div>
          )}
          {completionRate >= 90 && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="font-semibold text-black">Consistency King</p>
                <p className="text-xs text-black">90%+ completion</p>
              </div>
            </div>
          )}
          {totalCompleted >= 100 && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-3xl">💯</span>
              <div>
                <p className="font-semibold text-black">Century Club</p>
                <p className="text-xs text-black">100+ completions</p>
              </div>
            </div>
          )}
        </div>
        {currentStreak < 7 && completionRate < 90 && totalCompleted < 100 && (
          <p className="text-sm text-black text-center py-4">
            Keep tracking to unlock achievements! 🎯
          </p>
        )}
      </div>
    </div>
  )
}
