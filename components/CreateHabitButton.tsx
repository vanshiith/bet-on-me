'use client'

import { useState } from 'react'
import CreateHabitModal from './CreateHabitModal'

export default function CreateHabitButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        aria-label="Create a new habit"
      >
        <span className="text-xl">+</span>
        <span>New Habit</span>
      </button>
      <CreateHabitModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
