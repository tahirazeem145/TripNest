import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../../services/authService'
import { Eye, EyeOff, Mail, Lock } from './Icons'

function getFriendlyError(error) {
  const msg = error?.message?.toLowerCase() || ''
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Invalid email or password. Please try again.'
  if (msg.includes('email not confirmed'))
    return 'Please confirm your email address before logging in.'
  if (msg.includes('too many requests'))
    return 'Too many attempts. Please wait a moment and try again.'
  return 'Something went wrong. Please try again.'
}

export default function LoginForm() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await loginUser(form.email, form.password)
      navigate('/home')
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up" noValidate>
      {/* Error */}
      {error && <div className="error-box">{error}</div>}

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="glass-input pl-10"
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="form-label mb-0">Password</label>
          <button
            type="button"
            className="text-xs btn-ghost"
            tabIndex={-1}
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="login-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="glass-input pl-10 pr-10"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        id="btn-login"
        type="submit"
        className="btn-primary"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging in...
          </span>
        ) : 'Log In'}
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-white/60">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="btn-ghost text-sm">
          Create Account
        </Link>
      </p>
    </form>
  )
}
