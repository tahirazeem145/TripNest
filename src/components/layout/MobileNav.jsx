import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Globe, BookOpen, Camera, Bookmark, User, Users, Bell } from '../auth/Icons'

export default function MobileNav() {
  const [unreadCount, setUnreadCount] = useState(0)

  const navItems = [
    { to: '/home', label: 'Home', icon: Globe },
    { to: '/following', label: 'Following', icon: BookOpen },
    { to: '/travelers', label: 'Travelers', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell, isNotification: true },
    { to: '#create', label: 'Create', icon: Camera, action: () => alert('Photo sharing is coming next!') },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  useEffect(() => {
    function handleCountUpdate(e) {
      setUnreadCount(e.detail || 0)
    }
    window.addEventListener('unread_notifications_count', handleCountUpdate)
    return () => {
      window.removeEventListener('unread_notifications_count', handleCountUpdate)
    }
  }, [])

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 h-16 flex items-center justify-around px-4">
      {navItems.map((item) => {
        const Icon = item.icon
        
        if (item.action) {
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 transition relative ${
                isActive ? 'text-brand-400' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.isNotification && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
