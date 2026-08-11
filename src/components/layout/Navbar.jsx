import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'
import { Bell, Menu, LogOut, User, Settings, Camera } from '../auth/Icons'

export default function Navbar({ onMenuToggle }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">TripNest</span>
          </Link>
        </div>

        {/* Center: Desktop Quick Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/home" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition">Explore</Link>
          <button onClick={() => alert('Photo sharing is coming next!')} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition">Create</button>
          <Link to="/saved" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition">Saved</Link>
        </nav>

        {/* Right: Notifications & User Avatar Dropdown */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <Avatar className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="hidden md:block text-sm text-slate-300 group-hover:text-white font-medium transition-colors">
                {displayName.split(' ')[0]}
              </span>
              <svg className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                </div>
                
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition">
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition text-left">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                
                <div className="border-t border-slate-800 my-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
