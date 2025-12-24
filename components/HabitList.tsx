'use client'

import { useState } from 'react'
import { Habit } from '@/types/database'
import EditHabitModal from './EditHabitModal'
import DeleteHabitButton from './DeleteHabitButton'

interface HabitListProps {
  initialHabits: Habit[]
}

export default function HabitList({ initialHabits }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  if (initialHabits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-black mb-3">
            No habits yet
          </h3>
          <p className="text-black mb-6 leading-relaxed">
            Create your first habit to start building better routines with financial accountability.
            Every habit you track brings you closer to your goals!
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium">
            <span>Click "New Habit" above to get started</span>
            <span>→</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {initialHabits.map((habit) => (
          <div
            key={habit.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-black mb-3 truncate">
                  {habit.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-black bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span className="text-base">💰</span>
                    <span className="font-medium">${(habit.stake_cents / 100).toFixed(2)}</span>
                    <span className="text-black">penalty</span>
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    habit.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {habit.active ? '✓ Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingHabit(habit)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label={`Edit ${habit.name}`}
                >
                  Edit
                </button>
                <DeleteHabitButton habitId={habit.id} habitName={habit.name} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </>
  )
}
