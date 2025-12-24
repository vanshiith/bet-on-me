'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DeleteHabitButtonProps {
  habitId: string
  habitName: string
}

export default function DeleteHabitButton({ habitId, habitName }: DeleteHabitButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)

    const { error } = await supabase
      .from('habits')
      .update({ active: false })
      .eq('id', habitId)

    if (!error) {
      setShowConfirm(false)
      router.refresh()
    }
    setLoading(false)
  }

  if (showConfirm) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
          <h3 id="delete-dialog-title" className="text-xl font-bold text-black mb-3">
            Delete Habit?
          </h3>
          <p className="text-black mb-6 leading-relaxed">
            Are you sure you want to delete "<strong>{habitName}</strong>"? This will deactivate the habit and it won't appear in your daily tracking.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      aria-label={`Delete ${habitName}`}
    >
      Delete
    </button>
  )
}
