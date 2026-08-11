import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../../services/authService'
import { Eye, EyeOff, Mail, Lock, User } from './Icons'

function getFriendlyError(error) {
  const msg = error?.message?.toLowerCase() || ''
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate'))
    return 'An account with this email already exists. Please log in instead.'
  if (msg.includes('password') && msg.includes('least'))
    return 'Password must be at least 6 characters long.'
  if (msg.includes('valid email') || msg.includes('invalid email'))
    return 'Please enter a valid email address.'
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many requests. Please wait a moment and try again.'
  return 'Registration failed. Please check your details and try again.'
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  function validate() {
    if (!form.fullName.trim()) return 'Full name is required.'
    if (!form.email)           return 'Email address is required.'
    if (!form.email.includes('@')) return 'Please enter a valid email address.'
    if (!form.password)        return 'Password is required.'
    if (form.password.length < 6)  return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await registerUser(form.fullName.trim(), form.email, form.password)

      // If Supabase requires email confirmation, show message; otherwise redirect
      if (data?.user && !data.session) {
        setSuccess('Account created! Please check your email to confirm your account, then log in.')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" noValidate>
      {/* Error / Success */}
      {error   && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {/* Full Name */}
      <div>
        <label htmlFor="reg-name" className="form-label">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="reg-name"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="glass-input pl-10"
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="reg-email"
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
        <label htmlFor="reg-password" className="form-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="reg-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
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

      {/* Confirm Password */}
      <div>
        <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="reg-confirm"
            name="confirmPassword"
            type={showConf ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className="glass-input pl-10 pr-10"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConf(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            aria-label={showConf ? 'Hide password' : 'Show password'}
          >
            {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        id="btn-register"
        type="submit"
        className="btn-primary mt-2"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </span>
        ) : 'Create Account'}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="btn-ghost text-sm">
          Log In
        </Link>
      </p>
    </form>
  )
}
