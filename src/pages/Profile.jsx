import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { storageService } from '../services/storageService'
import { postService } from '../services/postService'
import { followService } from '../services/followService'
import { likeService } from '../services/likeService'
import { commentService } from '../services/commentService'
import { savedPostService } from '../services/savedPostService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import PostCard from '../components/feed/PostCard'
import EmptyFeed from '../components/feed/EmptyFeed'
import FollowButton from '../components/common/FollowButton'
import UserListModal from '../components/common/UserListModal'

export default function Profile() {
  const { user, profile: currentUserProfile } = useAuth()
  const { userId } = useParams()

  // Determine if viewing own profile or someone else's
  const activeUserId = userId || user?.id
  const isOwnProfile = !userId || userId === user?.id

  // Profile data states
  const [profileUser, setProfileUser] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  // Post states
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  // Engagement metadata maps
  const [likeCounts, setLikeCounts] = useState({})
  const [userLikes, setUserLikes] = useState(new Set())
  const [commentCounts, setCommentCounts] = useState({})
  const [userSaves, setUserSaves] = useState(new Set())

  // Follow counts states
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  // Modals state
  const [modalTitle, setModalTitle] = useState('')
  const [modalUsers, setModalUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 1. Fetch Profile User details
  async function fetchProfileData() {
    if (!activeUserId) return
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUserId)
        .single()

      if (error) throw error
      setProfileUser(data)
    } catch (err) {
      console.error('Failed to load profile user details:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  // 2. Fetch Follower & Following Counts
  async function fetchFollowCounts() {
    if (!activeUserId) return
    try {
      const [followers, following] = await Promise.all([
        followService.getFollowerCount(activeUserId),
        followService.getFollowingCount(activeUserId)
      ])
      setFollowerCount(followers)
      setFollowingCount(following)
    } catch (err) {
      console.error('Failed to fetch follow counts:', err)
    }
  }

  // 3. Fetch User Posts
  async function fetchUserPosts() {
    if (!activeUserId) return
    setPostsLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', activeUserId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const postsWithProfile = (data || []).map((post) => ({
        ...post,
        profile: profileUser || null
      }))
      setPosts(postsWithProfile)

      // Batch engagement data
      if (postsWithProfile.length > 0) {
        const postIds = postsWithProfile.map((p) => p.id)
        const [likesMap, userLikedSet, commentsMap, userSavedSet] = await Promise.all([
          likeService.getLikeCounts(postIds),
          user ? likeService.getUserLikes(postIds, user.id) : Promise.resolve(new Set()),
          commentService.getCommentCounts(postIds),
          user ? savedPostService.batchGetSavedStatus(user.id, postIds) : Promise.resolve(new Set())
        ])
        setLikeCounts(likesMap)
        setUserLikes(userLikedSet)
        setCommentCounts(commentsMap)
        setUserSaves(userSavedSet)
      }
    } catch (err) {
      console.error('Failed to load user posts:', err)
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
    fetchFollowCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId])

  // Fetch posts when profile user details are ready
  useEffect(() => {
    if (profileUser) {
      fetchUserPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUser])

  // Handle post deletion
  async function handleDeletePost(postId, imageUrl) {
    try {
      await postService.deletePost(postId)
      await storageService.deletePhoto(imageUrl)
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Could not delete post. Please try again.')
    }
  }

  // Open Followers Modal
  async function handleOpenFollowers() {
    setModalTitle('Followers')
    setIsModalOpen(true)
    setModalLoading(true)
    try {
      const followersList = await followService.getFollowers(activeUserId)
      setModalUsers(followersList)
    } catch (err) {
      console.error('Error fetching followers list:', err)
    } finally {
      setModalLoading(false)
    }
  }

  // Open Following Modal
  async function handleOpenFollowing() {
    setModalTitle('Following')
    setIsModalOpen(true)
    setModalLoading(true)
    try {
      const followingList = await followService.getFollowing(activeUserId)
      setModalUsers(followingList)
    } catch (err) {
      console.error('Error fetching following list:', err)
    } finally {
      setModalLoading(false)
    }
  }

  const displayName = profileUser?.full_name || profileUser?.email || 'Traveler'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          <h1 className="text-3xl font-display font-bold mb-2">
            {isOwnProfile ? 'Your Profile' : 'Traveler Profile'}
          </h1>
          <p className="text-slate-400 mb-8">
            {isOwnProfile ? 'Manage your traveler identity.' : `Explore ${displayName}'s journeys.`}
          </p>

          {profileLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading profile info...</p>
            </div>
          ) : (
            <div className="glass-card p-6 mb-8 border-slate-800 bg-slate-900/40">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Custom Profile Page Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-2xl font-bold text-white shadow-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                    <p className="text-sm text-slate-400 mb-3">{profileUser?.email}</p>
                    
                    {/* Follow stats count display triggers */}
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-300 mt-2 mb-3">
                      <button
                        onClick={handleOpenFollowers}
                        className="hover:text-brand-400 transition"
                      >
                        <span className="font-bold text-white mr-1">{followerCount}</span>
                        followers
                      </button>
                      <span className="text-slate-650">•</span>
                      <button
                        onClick={handleOpenFollowing}
                        className="hover:text-brand-400 transition"
                      >
                        <span className="font-bold text-white mr-1">{followingCount}</span>
                        following
                      </button>
                    </div>

                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {profileUser?.role || 'USER'} Account
                    </div>
                  </div>
                </div>

                {/* Follow Button logic */}
                {!isOwnProfile && (
                  <div className="flex justify-center sm:justify-end">
                    <FollowButton
                      targetUserId={activeUserId}
                      onStatusChange={(newStatus) => {
                        setFollowerCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)))
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-6">
            {isOwnProfile ? 'Your Journeys' : `${displayName}'s Journeys`}
          </h3>

          {postsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading journeys...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  likeCount={likeCounts[post.id] || 0}
                  commentCount={commentCounts[post.id] || 0}
                  hasLiked={userLikes.has(post.id)}
                  isSaved={userSaves.has(post.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyFeed />
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileNav />

      {/* Followers/Following Modal list display */}
      {isModalOpen && (
        <UserListModal
          title={modalTitle}
          users={modalUsers}
          onClose={() => setIsModalOpen(false)}
          onFollowChange={() => {
            fetchFollowCounts()
            if (modalTitle === 'Followers') {
              handleOpenFollowers()
            } else {
              handleOpenFollowing()
            }
          }}
        />
      )}
    </div>
  )
}
