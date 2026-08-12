import { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { likeService } from '../../services/likeService'
import { savedPostService } from '../../services/savedPostService'
import CommentSection from './CommentSection'
import Avatar from '../common/Avatar'

export default function PostCard({
  post,
  onDelete,
  likeCount: initialLikeCount = 0,
  commentCount: initialCommentCount = 0,
  hasLiked: initialHasLiked = false,
  isSaved: initialIsSaved = false,
  onUnsave, // Callback to instantly remove post from Saved page
}) {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isOwner = user && user.id === post.user_id

  // Like state
  const [liked, setLiked] = useState(initialHasLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [likeLoading, setLikeLoading] = useState(false)
  const [likeError, setLikeError] = useState('')

  // Comment state
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(initialCommentCount)

  // Save/Bookmark state
  const [saved, setSaved] = useState(initialIsSaved)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const displayName = post.profile?.full_name || post.profile?.email || 'Traveler'

  // ─── Like Handler ─────────────────────────────────────────
  const handleLikeToggle = useCallback(async () => {
    if (!user || likeLoading) return

    setLikeLoading(true)
    setLikeError('')

    // Optimistic update
    const wasLiked = liked
    const prevCount = likeCount
    setLiked(!wasLiked)
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1)

    try {
      if (wasLiked) {
        await likeService.unlikePost(post.id, user.id)
      } else {
        await likeService.likePost(post.id, user.id)
      }
    } catch (err) {
      // Rollback on failure
      console.error('Like toggle failed:', err)
      setLiked(wasLiked)
      setLikeCount(prevCount)
      setLikeError('Unable to update like. Please try again.')
      setTimeout(() => setLikeError(''), 3000)
    } finally {
      setLikeLoading(false)
    }
  }, [user, liked, likeCount, likeLoading, post.id])

  // ─── Save/Bookmark Handler ─────────────────────────────────
  const handleSaveToggle = useCallback(async () => {
    if (!user || saveLoading) return

    setSaveLoading(true)
    setSaveError('')

    const wasSaved = saved
    // Optimistic UI Update
    setSaved(!wasSaved)

    try {
      if (wasSaved) {
        await savedPostService.unsavePost(user.id, post.id)
        if (onUnsave) {
          onUnsave(post.id)
        }
      } else {
        await savedPostService.savePost(user.id, post.id)
      }
    } catch (err) {
      // Rollback
      console.error('Save toggle failed:', err)
      setSaved(wasSaved)
      setSaveError(wasSaved ? 'Unable to remove this saved post. Please try again.' : 'Unable to save this post. Please try again.')
      setTimeout(() => setSaveError(''), 3000)
    } finally {
      setSaveLoading(false)
    }
  }, [user, saved, saveLoading, post.id, onUnsave])

  // ─── Comment count callback ───────────────────────────────
  const handleCommentCountChange = useCallback((newCount) => {
    setCommentCount(Math.max(0, newCount))
  }, [])

  return (
    <article className="glass-card overflow-hidden bg-slate-900/40 border-slate-800/80 mb-6 hover:bg-slate-900/60 transition duration-300">
      
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <Avatar profile={post.profile} className="w-9 h-9" />
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

      {/* Card Image — adapts to original aspect ratio */}
      <div className="relative bg-slate-950 overflow-hidden group">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-700"
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
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-brand-400 hover:text-brand-300 cursor-pointer transition">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ─── Action Bar (Like + Comment + Bookmark) ────────── */}
        <div className="flex items-center gap-1 pt-2 border-t border-slate-800/40">
          {/* Like Button */}
          <button
            id={`like-btn-${post.id}`}
            onClick={handleLikeToggle}
            disabled={likeLoading || !user}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${liked
                ? 'text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
              }
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95
            `}
          >
            <span className={`text-base transition-transform duration-200 ${liked ? 'scale-110' : ''}`}>
              {liked ? '❤️' : '♡'}
            </span>
            <span>{likeCount}</span>
          </button>

          {/* Comment Button */}
          <button
            id={`comment-btn-${post.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${showComments
                ? 'text-brand-400 bg-brand-500/10 hover:bg-brand-500/20'
                : 'text-slate-400 hover:text-brand-400 hover:bg-slate-800/60'
              }
              active:scale-95
            `}
          >
            <span className="text-base">💬</span>
            <span>{commentCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            id={`save-btn-${post.id}`}
            onClick={handleSaveToggle}
            disabled={saveLoading || !user}
            className={`
              ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${saved
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/60'
              }
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95
            `}
          >
            <span className="text-base">🔖</span>
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Errors display */}
        {likeError && (
          <p className="text-xs text-red-400 mt-1.5 animate-fade-in">{likeError}</p>
        )}
        {saveError && (
          <p className="text-xs text-red-400 mt-1.5 animate-fade-in">{saveError}</p>
        )}
      </div>

      {/* ─── Comment Section (expandable) ──────────────────── */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCountChange={handleCommentCountChange}
        />
      )}
    </article>
  )
}
