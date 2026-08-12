import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { commentService } from '../../services/commentService'

const MAX_COMMENT_LENGTH = 500

/**
 * Format a timestamp into a human-readable relative time string.
 */
function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommentSection({ postId, onCountChange }) {
  const { user, profile } = useAuth()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New comment input
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const inputRef = useRef(null)

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState(null)

  // Fetch comments on mount
  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  async function fetchComments() {
    setLoading(true)
    setError('')
    try {
      const data = await commentService.getComments(postId)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments:', err)
      setError('Unable to load comments.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Add Comment ───────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = newComment.trim()

    if (!trimmed) {
      setSubmitError('Comment cannot be empty.')
      return
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmitError(`Comment must be ${MAX_COMMENT_LENGTH} characters or less.`)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const inserted = await commentService.addComment(postId, user.id, trimmed)

      // Attach current user's profile to the new comment for immediate display
      const newCommentWithProfile = {
        ...inserted,
        profile: profile
          ? { id: profile.id, full_name: profile.full_name, email: profile.email, profile_photo: profile.profile_photo }
          : null
      }

      setComments((prev) => [...prev, newCommentWithProfile])
      setNewComment('')
      if (onCountChange) onCountChange(comments.length + 1)
    } catch (err) {
      console.error('Failed to post comment:', err)
      setSubmitError('Unable to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Edit Comment ──────────────────────────────────────────
  function startEdit(comment) {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function handleEditSave(commentId) {
    const trimmed = editContent.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_COMMENT_LENGTH) return

    setEditSubmitting(true)
    try {
      const updated = await commentService.updateComment(commentId, trimmed)
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: updated.content, updated_at: updated.updated_at } : c))
      )
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      console.error('Failed to update comment:', err)
      alert('Unable to update comment. Please try again.')
    } finally {
      setEditSubmitting(false)
    }
  }

  // ─── Delete Comment ────────────────────────────────────────
  async function handleDelete(commentId) {
    if (!window.confirm('Delete this comment?')) return

    setDeletingId(commentId)
    try {
      await commentService.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      if (onCountChange) onCountChange(comments.length - 1)
    } catch (err) {
      console.error('Failed to delete comment:', err)
      alert('Unable to delete comment. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Helpers ───────────────────────────────────────────────
  function getInitials(displayName) {
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="border-t border-slate-800/60 bg-slate-950/40">
      {/* Section Header */}
      <div className="px-4 pt-3 pb-2">
        <h5 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
          💬 <span>Comments</span>
        </h5>
      </div>

      {/* Comments List */}
      <div className="px-4 max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
            <span className="ml-2 text-xs text-slate-400">Loading comments...</span>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={fetchComments}
              className="text-xs text-brand-400 hover:text-brand-300 mt-1 transition"
            >
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center italic">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="space-y-3 pb-2">
            {comments.map((comment) => {
              const displayName = comment.profile?.full_name || comment.profile?.email || 'Traveler'
              const initials = getInitials(displayName)
              const isOwner = user && user.id === comment.user_id
              const isEditing = editingId === comment.id
              const isDeleting = deletingId === comment.id

              return (
                <div
                  key={comment.id}
                  className={`group flex gap-2.5 py-2 transition-opacity ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700 flex-shrink-0 mt-0.5">
                    {initials}
                  </div>

                  {/* Comment Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-white truncate">{displayName}</span>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">{timeAgo(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-[10px] text-slate-600 italic flex-shrink-0">(edited)</span>
                      )}
                    </div>

                    {isEditing ? (
                      /* Edit Mode */
                      <div className="mt-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={MAX_COMMENT_LENGTH}
                          rows={2}
                          className="w-full text-xs text-white bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-500">
                            {editContent.trim().length} / {MAX_COMMENT_LENGTH}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEdit}
                              disabled={editSubmitting}
                              className="text-[11px] text-slate-400 hover:text-white transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditSave(comment.id)}
                              disabled={editSubmitting || !editContent.trim() || editContent.trim().length > MAX_COMMENT_LENGTH}
                              className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold transition disabled:opacity-40"
                            >
                              {editSubmitting ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <p className="text-xs text-slate-300 leading-relaxed break-words">{comment.content}</p>
                    )}

                    {/* Owner Actions (Edit / Delete) */}
                    {isOwner && !isEditing && (
                      <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-[11px] text-slate-500 hover:text-brand-400 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-[11px] text-slate-500 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-3 pt-2 border-t border-slate-800/40">
        {submitError && (
          <p className="text-[11px] text-red-400 mb-1.5">{submitError}</p>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                if (submitError) setSubmitError('')
              }}
              placeholder="Write a comment..."
              maxLength={MAX_COMMENT_LENGTH}
              disabled={submitting}
              className="w-full text-xs text-white bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2.5 pr-14 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-transparent transition disabled:opacity-50"
            />
            {newComment.length > 0 && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${newComment.trim().length > MAX_COMMENT_LENGTH ? 'text-red-400' : 'text-slate-500'}`}>
                {newComment.trim().length}/{MAX_COMMENT_LENGTH}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
