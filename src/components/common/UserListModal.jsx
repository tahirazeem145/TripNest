import { X } from '../auth/Icons'
import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'

export default function UserListModal({ title, users, onClose, onFollowChange }) {
  function getInitials(displayName) {
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white text-base">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8 italic">No users found.</p>
          ) : (
            users.map((profileUser) => {
              const displayName = profileUser.full_name || profileUser.email || 'Traveler'
              const initials = getInitials(displayName)

              return (
                <div key={profileUser.id} className="flex items-center justify-between gap-3">
                  <Link
                    to={`/profile/${profileUser.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 hover:opacity-85 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700 flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate leading-snug">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{profileUser.email}</p>
                    </div>
                  </Link>
                  <FollowButton
                    targetUserId={profileUser.id}
                    onStatusChange={() => onFollowChange && onFollowChange()}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
