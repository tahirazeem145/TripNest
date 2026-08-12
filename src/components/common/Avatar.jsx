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

  const photoUrl = profile?.profile_photo

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={displayName}
        className={`rounded-full object-cover border border-slate-800 flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
