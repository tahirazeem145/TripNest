import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isOwner = user && user.id === post.user_id

  const displayName = post.profile?.full_name || post.profile?.email || 'Traveler'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <article className="glass-card overflow-hidden bg-slate-900/40 border-slate-800/80 mb-6 hover:bg-slate-900/60 transition duration-300">
      
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-none mb-1">{displayName}</h3>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{post.destination}</span>
            </p>
          </div>
        </div>

        {/* Dropdown Options (Delete only visible to post owner) */}
        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl bg-slate-950 border border-slate-800 shadow-xl py-1 z-10">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    if (window.confirm('Are you sure you want to delete this travel post?')) {
                      onDelete(post.id, post.image_url)
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800/60 transition"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Image */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden group">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Card Content & Action Bar */}
      <div className="p-4">
        {/* Title */}
        <h4 className="text-lg font-bold text-white mb-1.5">{post.title}</h4>

        {/* Content text */}
        {post.description && (
          <p className="text-sm text-slate-200 leading-relaxed mb-3">
            {post.description}
          </p>
        )}

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-brand-400 hover:text-brand-300 cursor-pointer transition">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
