import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'DASHBOARD', icon: 'space_dashboard' },
  { to: '/practice',  label: 'SIMULATIONS', icon: 'psychology' },
  { to: '/learn',     label: 'ACADEMY', icon: 'school' },
  { to: '/history',   label: 'PROGRESS', icon: 'query_stats' },
]

export function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { signOut } = useAuthStore()
  const { isDark, toggle } = useTheme()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      {/* Desktop side nav */}
      <nav className="hidden md:flex flex-col h-screen py-8 px-6 w-64 border-r flex-shrink-0"
           style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-lo)' }}>
        {/* Brand */}
        <div className="mb-12">
          <h1 className="font-display text-3xl font-semibold tracking-tighter" style={{ color: 'var(--text-hi)' }}>SEEZ</h1>
          <p className="label-caps mt-1" style={{ color: 'var(--text-mid)', opacity: 0.6 }}>ELITE TERMINAL</p>
        </div>

        {/* Nav links */}
        <div className="flex-grow flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-4 label-caps py-2.5 border-r-2 transition-colors duration-200',
                isActive(to)
                  ? 'text-[#dcc662] border-[#dcc662]'
                  : 'border-transparent hover:text-[#c8c6c5]'
              )}
              style={isActive(to) ? {} : { color: 'var(--text-mid)' }}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-4">
          <Link
            to="/practice"
            className="w-full h-12 bg-[#dcc662] text-[#393000] label-caps flex items-center justify-center gap-2 hover:bg-[#c9b452] transition-colors"
          >
            ENTER ARENA
          </Link>

          <div className="flex flex-col gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-mid)' }}>
            <Link
              to="/profile"
              className={cn('flex items-center gap-4 label-caps transition-colors', isActive('/profile') ? 'text-[#dcc662]' : 'hover:text-[#c8c6c5]')}
              style={isActive('/profile') ? {} : { color: 'var(--text-mid)' }}
            >
              <span className="material-symbols-outlined text-xl">person</span>
              PROFILE
            </Link>
            <Link
              to="/settings"
              className={cn('flex items-center gap-4 label-caps transition-colors', isActive('/settings') ? 'text-[#dcc662]' : 'hover:text-[#c8c6c5]')}
              style={isActive('/settings') ? {} : { color: 'var(--text-mid)' }}
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              SETTINGS
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-4 label-caps transition-colors hover:text-[#c8c6c5]"
              style={{ color: 'var(--text-mid)' }}
            >
              <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
              {isDark ? 'LIGHT MODE' : 'DARK MODE'}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-4 label-caps transition-colors hover:text-[#c8c6c5]"
              style={{ color: 'var(--text-mid)' }}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              SIGN OUT
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-14 px-5 border-b"
              style={{ backgroundColor: 'var(--bg-nav)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-lo)' }}>
        <span className="font-display text-2xl font-semibold" style={{ color: 'var(--text-hi)' }}>SEEZ</span>
        <div className="flex items-center gap-3">
          {NAV_ITEMS.map(({ to, icon }) => (
            <Link key={to} to={to}>
              <span className={cn('material-symbols-outlined text-xl', isActive(to) ? 'text-[#dcc662]' : 'text-[#8e9192]')}>
                {icon}
              </span>
            </Link>
          ))}
          <button onClick={toggle} style={{ color: 'var(--text-mid)' }}>
            <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={handleSignOut}>
            <span className="material-symbols-outlined text-xl text-[#8e9192]">logout</span>
          </button>
        </div>
      </header>
    </>
  )
}
