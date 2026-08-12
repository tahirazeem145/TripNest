import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { followService } from '../../services/followService'

export default function FollowButton({ targetUserId, onStatusChange }) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const isOwnProfile = user?.id === targetUserId

  useEffect(() => {
    async function checkStatus() {
      if (!user || isOwnProfile) {
        setLoading(false)
        return
      }
      try {
        const following = await followService.isFollowing(user.id, targetUserId)
        setIsFollowing(following)
      } catch (err) {
        console.error('Error checking follow status:', err)
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [user, targetUserId, isOwnProfile])

  async function handleFollowToggle(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!user || actionLoading) return

    setActionLoading(true)
    setError('')

    const originalState = isFollowing
    // Optimistic UI Update
    setIsFollowing(!originalState)

    try {
      if (originalState) {
        await followService.unfollowUser(user.id, targetUserId)
      } else {
        await followService.followUser(user.id, targetUserId)
      }
      if (onStatusChange) {
        onStatusChange(!originalState)
      }
    } catch (err) {
      console.error('Follow toggle error:', err)
      setIsFollowing(originalState)
      setError('Unable to update follow status. Please try again.')
      setTimeout(() => setError(''), 4000)
    } finally {
      setActionLoading(false)
    }
  }

  if (isOwnProfile) return null

  if (loading) {
    return (
      <button disabled className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 cursor-not-allowed">
        Checking...
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleFollowToggle}
        disabled={actionLoading}
        className={`px-4 py-2 text-xs font-semibold rounded-xl transition duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
            : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
        }`}
      >
        {actionLoading ? (
          isFollowing ? 'Unfollowing...' : 'Following...'
        ) : (
          isFollowing ? '✓ Following' : '+ Follow'
        )}
      </button>
      {error && (
        <span className="text-[10px] text-red-400 mt-1 text-center font-medium block max-w-[200px]">
          {error}
        </span>
      )}
    </div>
  )
}
