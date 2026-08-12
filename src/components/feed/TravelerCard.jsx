import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FollowButton from '../common/FollowButton'
import { followService } from '../../services/followService'

export default function TravelerCard({ traveler, onFollowChange }) {
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const displayName = traveler.full_name || traveler.email || 'Traveler'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function fetchCounts() {
    try {
      const [followers, following] = await Promise.all([
        followService.getFollowerCount(traveler.id),
        followService.getFollowingCount(traveler.id),
      ])
      setFollowerCount(followers)
      setFollowingCount(following)
    } catch (err) {
      console.error('Error fetching traveler card counts:', err)
    }
  }

  useEffect(() => {
    fetchCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traveler.id])

  return (
    <div className="glass-card p-5 bg-slate-900/40 border-slate-800/80 flex flex-col items-center justify-between text-center hover:bg-slate-900/60 transition duration-300">
      <Link to={`/profile/${traveler.id}`} className="flex flex-col items-center group w-full mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-lg font-bold text-white shadow-md group-hover:scale-105 transition-transform mb-3">
          {initials}
        </div>
        
        {/* Name & Bio */}
        <h3 className="font-semibold text-white text-base group-hover:text-brand-300 transition-colors truncate w-full px-2">
          {displayName}
        </h3>
        {traveler.bio ? (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 px-2 min-h-[2rem]">
            {traveler.bio}
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-1 italic px-2 min-h-[2rem]">
            No bio shared.
          </p>
        )}
      </Link>

      {/* Engagement Stats */}
      <div className="flex items-center gap-6 mb-4 text-xs text-slate-400">
        <div>
          <span className="block font-bold text-white text-sm">{followerCount}</span>
          <span>Followers</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-bold text-white text-sm">{followingCount}</span>
          <span>Following</span>
        </div>
      </div>

      {/* Follow Button */}
      <div className="w-full flex justify-center">
        <FollowButton
          targetUserId={traveler.id}
          onStatusChange={(newStatus) => {
            setFollowerCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)))
            if (onFollowChange) onFollowChange()
          }}
        />
      </div>
    </div>
  )
}
