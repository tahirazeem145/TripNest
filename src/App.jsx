import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import SavedPosts from './pages/SavedPosts'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Travelers from './pages/Travelers'
import Following from './pages/Following'
import Notifications from './pages/Notifications'

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
      <Route path="/home"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/travelers"     element={<ProtectedRoute><Travelers /></ProtectedRoute>} />
      <Route path="/following"     element={<ProtectedRoute><Following /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/saved"         element={<ProtectedRoute><SavedPosts /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/create"        element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

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
