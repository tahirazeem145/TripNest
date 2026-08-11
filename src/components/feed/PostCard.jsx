import { useState } from 'react'

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  function handleLike() {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <article className="glass-card overflow-hidden bg-slate-900/40 border-slate-800/80 mb-6 hover:bg-slate-900/60 transition duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          {/* Mock User Avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700">
            {post.userInitials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-none mb-1">{post.user}</h3>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{post.location}</span>
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      {/* Card Image */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden group">
        <img
          src={post.imageUrl}
          alt={post.location}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Mock/Demo Data Ribbon */}
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-[10px] font-semibold text-slate-400 tracking-wider uppercase border border-slate-700">
          Demo Card
        </span>
      </div>

      {/* Card Content & Action Bar */}
      <div className="p-4">
        {/* Action icons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                liked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={liked ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>

            {/* Comment */}
            <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-brand-400 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments}</span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-emerald-400 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.632-2.316m0 0a3 3 0 10-2.676-4.32l-4.632 2.316m0 0a3 3 0 100 4.322l4.632 2.316m0 0a3 3 0 102.676-4.32l-4.632-2.316" />
              </svg>
            </button>
          </div>

          {/* Bookmark */}
          <button 
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition ${
              saved ? 'text-brand-400' : 'text-slate-300 hover:text-brand-400'
            }`}
          >
            <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={saved ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{post.saved + (saved ? 1 : 0)}</span>
          </button>
        </div>

        {/* Content text */}
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          <strong className="text-white mr-1.5">{post.user}</strong>
          {post.description}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs font-semibold text-brand-400 hover:text-brand-300 cursor-pointer transition">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
