import { useAuth } from '../../context/AuthContext'

export default function Avatar({ className = "w-10 h-10" }) {
  const { user, profile } = useAuth()
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
