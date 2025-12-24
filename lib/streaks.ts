interface Occurrence {
  date: string
  status: 'pending' | 'completed' | 'missed'
}

/**
 * Calculate current streak for a habit
 * A streak is the number of consecutive days with completed status
 */
export function calculateCurrentStreak(occurrences: Occurrence[]): number {
  if (occurrences.length === 0) return 0

  // Sort by date descending (most recent first)
  const sorted = [...occurrences].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let checkDate = today

  for (const occ of sorted) {
    // If we've skipped a day, break the streak
    if (occ.date !== checkDate) {
      break
    }

    // Only count completed occurrences
    if (occ.status === 'completed') {
      streak++
      // Move to previous day
      const prevDate = new Date(checkDate)
      prevDate.setDate(prevDate.getDate() - 1)
      checkDate = prevDate.toISOString().split('T')[0]
    } else {
      // Streak broken
      break
    }
  }

  return streak
}

/**
 * Calculate longest streak for a habit
 */
export function calculateLongestStreak(occurrences: Occurrence[]): number {
  if (occurrences.length === 0) return 0

  // Sort by date ascending
  const sorted = [...occurrences].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let longestStreak = 0
  let currentStreak = 0
  let prevDate: Date | null = null

  for (const occ of sorted) {
    const currentDate = new Date(occ.date)

    if (occ.status === 'completed') {
      // Check if this is consecutive with previous date
      if (prevDate) {
        const dayDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (dayDiff === 1) {
          currentStreak++
        } else {
          // Gap in streak, start over
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }

      longestStreak = Math.max(longestStreak, currentStreak)
      prevDate = currentDate
    } else {
      // Missed or pending breaks the streak
      currentStreak = 0
      prevDate = null
    }
  }

  return longestStreak
}

/**
 * Calculate completion rate (percentage)
 */
export function calculateCompletionRate(occurrences: Occurrence[]): number {
  if (occurrences.length === 0) return 0

  const completed = occurrences.filter(occ => occ.status === 'completed').length
  return Math.round((completed / occurrences.length) * 100)
}

/**
 * Get weekly statistics for the last N weeks
 */
export function getWeeklyStats(occurrences: Occurrence[], weeks: number = 4) {
  const weekStats: Array<{
    weekStart: string
    weekEnd: string
    completed: number
    total: number
    rate: number
  }> = []

  const today = new Date()

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() - (i * 7))

    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)

    const weekOccurrences = occurrences.filter(occ => {
      const occDate = new Date(occ.date)
      return occDate >= weekStart && occDate <= weekEnd
    })

    const completed = weekOccurrences.filter(o => o.status === 'completed').length
    const total = weekOccurrences.length

    weekStats.push({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }

  return weekStats.reverse() // Return oldest to newest
}

/**
 * Get monthly statistics for the last N months
 */
export function getMonthlyStats(occurrences: Occurrence[], months: number = 6) {
  const monthStats: Array<{
    month: string
    year: number
    completed: number
    total: number
    rate: number
  }> = []

  const today = new Date()

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

    const monthOccurrences = occurrences.filter(occ => {
      const occDate = new Date(occ.date)
      return occDate >= monthStart && occDate <= monthEnd
    })

    const completed = monthOccurrences.filter(o => o.status === 'completed').length
    const total = monthOccurrences.length

    monthStats.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      year: monthDate.getFullYear(),
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0
    })
  }

  return monthStats.reverse() // Return oldest to newest
}
