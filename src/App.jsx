import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Saved from './pages/Saved'
import Profile from './pages/Profile'

// ProtectedRoute: redirects to /login if user is not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

// PublicRoute: redirects authenticated users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <Navigate to="/home" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default: redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes — redirect to /home if already logged in */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/home"     element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/explore"  element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/saved"    element={<ProtectedRoute><Saved /></ProtectedRoute>} />
      <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
