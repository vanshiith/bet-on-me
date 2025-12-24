import Link from 'next/link'
import LogoutButton from './LogoutButton'

interface NavigationProps {
  currentPath?: 'dashboard' | 'habits' | 'today' | 'penalties' | 'analytics' | 'settings'
}

export default function Navigation({ currentPath = 'dashboard' }: NavigationProps) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', key: 'dashboard', icon: '📊' },
    { label: 'Today', path: '/dashboard/today', key: 'today', icon: '✓' },
    { label: 'Habits', path: '/dashboard/habits', key: 'habits', icon: '🎯' },
    { label: 'Analytics', path: '/dashboard/analytics', key: 'analytics', icon: '📈' },
    { label: 'Penalties', path: '/dashboard/penalties', key: 'penalties', icon: '💰' },
    { label: 'Settings', path: '/dashboard/settings', key: 'settings', icon: '⚙️' },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                BetOnMe
              </h1>
            </Link>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentPath === item.key
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
