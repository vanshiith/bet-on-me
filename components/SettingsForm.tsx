'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  email: string
  timezone: string | null
  bedtime_hour: number | null
  email_notifications_enabled?: boolean
}

interface SettingsFormProps {
  userData: UserData | null
}

// Common timezones for easier selection
const commonTimezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC',
]

// Hours for bedtime selection (6 PM to 2 AM)
const bedtimeHours = [
  { value: 18, label: '6:00 PM' },
  { value: 19, label: '7:00 PM' },
  { value: 20, label: '8:00 PM' },
  { value: 21, label: '9:00 PM' },
  { value: 22, label: '10:00 PM' },
  { value: 23, label: '11:00 PM' },
  { value: 0, label: '12:00 AM (Midnight)' },
  { value: 1, label: '1:00 AM' },
  { value: 2, label: '2:00 AM' },
]

export default function SettingsForm({ userData }: SettingsFormProps) {
  const [timezone, setTimezone] = useState(userData?.timezone || 'America/New_York')
  const [bedtimeHour, setBedtimeHour] = useState(userData?.bedtime_hour || 22)
  const [emailNotifications, setEmailNotifications] = useState(userData?.email_notifications_enabled !== false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('users')
      .update({
        timezone,
        bedtime_hour: bedtimeHour,
        email_notifications_enabled: emailNotifications,
      })
      .eq('id', userData?.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      router.refresh()
    }

    setLoading(false)
  }

  const detectTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(detected)
    setMessage({ type: 'success', text: `Detected timezone: ${detected}` })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 max-w-2xl animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={userData?.email || ''}
            disabled
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
          />
          <p className="text-xs text-slate-500 mt-2">Email cannot be changed</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="timezone" className="block text-sm font-semibold text-slate-700">
              Timezone
            </label>
            <button
              type="button"
              onClick={detectTimezone}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wide transition-colors"
            >
              ✨ Auto-detect
            </button>
          </div>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            {commonTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-2">
            Your timezone affects when daily check-ins reset
          </p>
        </div>

        <div>
          <label htmlFor="bedtime" className="block text-sm font-semibold text-slate-700 mb-3">
            Daily Deadline (Bedtime)
          </label>
          <select
            id="bedtime"
            value={bedtimeHour}
            onChange={(e) => setBedtimeHour(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            {bedtimeHours.map((hour) => (
              <option key={hour.value} value={hour.value}>
                {hour.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-2">
            You must check in your habits before this time each day
          </p>
        </div>

        <div className="border-t-2 border-slate-200 pt-8">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Notifications</h3>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 shadow-sm">
            <div>
              <label htmlFor="email-notifications" className="text-base font-bold text-slate-900">
                Email Reminders
              </label>
              <p className="text-sm text-slate-600 mt-1.5">
                Receive daily reminders to check in your habits
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-lg ${
                emailNotifications ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={emailNotifications}
              id="email-notifications"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                  emailNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {emailNotifications && (
            <div className="mt-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl shadow-sm animate-fade-in">
              <p className="text-sm text-indigo-900 font-medium">
                📧 You'll receive reminders at 9 AM, 3 PM, and 8 PM to check in your pending habits.
              </p>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`p-5 rounded-2xl shadow-md border-2 animate-fade-in ${
              message.type === 'success'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
            }`}
          >
            <p
              className={`text-sm font-bold ${
                message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-base shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            {loading ? 'Saving...' : '✓ Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
