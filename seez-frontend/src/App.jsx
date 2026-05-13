import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Navbar } from './components/common/Navbar'
import { ThemeProvider } from './context/ThemeContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import CallActive from './pages/CallActive'
import Eval from './pages/Eval'
import History from './pages/History'
import Learn from './pages/Learn'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border border-[#444748]/30 bg-[#1e2020]">
            <svg className="animate-spin h-5 w-5 text-[#dcc662]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="label-caps text-[#8e9192]">LOADING</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

const PUBLIC_PATHS = ['/', '/login', '/signup']

function AppShell() {
  const location = useLocation()
  const { init } = useAuthStore()

  useEffect(() => { init() }, [])

  const hideNav = PUBLIC_PATHS.includes(location.pathname) || location.pathname.startsWith('/call/')

  const allRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
      <Route path="/call/active" element={<ProtectedRoute><CallActive /></ProtectedRoute>} />
      <Route path="/eval/:callId" element={<ProtectedRoute><Eval /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  if (hideNav) return allRoutes

  return (
    <div className="flex h-screen overflow-hidden seez-shell">
      <Navbar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {allRoutes}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  )
}
