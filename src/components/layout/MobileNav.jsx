import { NavLink } from 'react-router-dom'
import { Globe, BookOpen, Camera, Bookmark, User } from '../auth/Icons'

export default function MobileNav() {
  const navItems = [
    { to: '/home', label: 'Home', icon: Globe },
    { to: '/explore', label: 'Explore', icon: BookOpen },
    { to: '#create', label: 'Create', icon: Camera, action: () => alert('Photo sharing is coming next!') },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/profile', label: 'Profile', icon: User },
  ]

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
              <Icon className="w-5.5 h-5.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 transition ${
                isActive ? 'text-brand-400' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
