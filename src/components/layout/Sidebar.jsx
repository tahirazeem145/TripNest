import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Globe, Camera, BookOpen, Bookmark, User, X, Users, Bell } from '../auth/Icons'

export default function Sidebar({ isOpen, onClose }) {
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 p-4">
      {/* Mobile only Close button */}
      <div className="flex items-center justify-end lg:hidden mb-4">
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          
          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition group text-left"
              >
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span>{item.label}</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition group ${
                  isActive 
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span>{item.label}</span>
              </div>
              {item.isNotification && unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
      
      <div className="mt-auto border-t border-slate-800/60 pt-4 px-2">
        <p className="text-xs text-slate-500 text-center font-medium">TripNest Community Platform</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay backdrop */}
          <div 
            onClick={onClose} 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          ></div>
          
          {/* Drawer body */}
          <div className="relative flex flex-col w-72 max-w-xs h-full animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
