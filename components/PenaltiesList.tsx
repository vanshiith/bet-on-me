'use client'

interface Habit {
  id: string
  name: string
}

interface HabitOccurrence {
  id: string
  date: string
  status: string
}

interface Penalty {
  id: string
  amount_cents: number
  status: string
  created_at: string
  habits: Habit
  habit_occurrences: HabitOccurrence
}

interface PenaltiesListProps {
  penalties: Penalty[]
}

export default function PenaltiesList({ penalties }: PenaltiesListProps) {
  if (penalties.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h3 className="text-2xl font-bold text-black mb-3">
            Perfect Record!
          </h3>
          <p className="text-black mb-6 leading-relaxed">
            You haven't missed any habits yet. Keep up the great work!
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
            <span>Stay consistent to maintain your streak</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    )
  }

  // Group penalties by month
  const penaltiesByMonth = penalties.reduce((acc, penalty) => {
    const date = new Date(penalty.created_at)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(penalty)
    return acc
  }, {} as Record<string, Penalty[]>)

  return (
    <div className="space-y-8">
      {Object.entries(penaltiesByMonth).map(([month, monthPenalties]) => {
        const monthTotal = monthPenalties.reduce((sum, p) => sum + p.amount_cents, 0)

        return (
          <div key={month}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">{month}</h3>
              <span className="text-sm font-medium text-black">
                ${(monthTotal / 100).toFixed(2)} total
              </span>
            </div>

            <div className="grid gap-3">
              {monthPenalties.map((penalty) => {
                const occurrenceDate = new Date(penalty.habit_occurrences.date)
                const formattedDate = occurrenceDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })

                return (
                  <div
                    key={penalty.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black mb-1 truncate">
                          {penalty.habits.name}
                        </h4>
                        <p className="text-sm text-black">
                          {formattedDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          -${(penalty.amount_cents / 100).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          penalty.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                          penalty.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {penalty.status === 'succeeded' ? 'Processed' :
                           penalty.status === 'failed' ? 'Failed' :
                           'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
