import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
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
  const { user } = useAuth()
  const { userId } = useParams()
  const fileInputRef = useRef(null)

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

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editInterests, setEditInterests] = useState('')
  const [editPhotoFile, setEditPhotoFile] = useState(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Fetch Profile User details
  async function fetchProfileData() {
    if (!activeUserId) return
    setProfileLoading(true)
    try {
      const data = await profileService.getProfile(activeUserId)
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
      const result = await postService.getPostsByUser(activeUserId)
      const data = result?.data ?? result ?? []

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
      if (imageUrl) {
        await storageService.deletePhoto(imageUrl)
      }
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

  // Initialize Edit form values
  function handleOpenEdit() {
    setEditName(profileUser?.full_name || '')
    setEditBio(profileUser?.bio || '')
    setEditInterests(profileUser?.travel_interests || '')
    setEditPhotoPreview(profileUser?.profile_photo || '')
    setEditPhotoFile(null)
    setErrorMsg('')
    setIsEditing(true)
  }

  // Handle local photo selection & validation
  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Only JPEG, PNG, and WEBP images are allowed.')
      return
    }

    // Size validation (2MB limit)
    const maxBytes = 2 * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorMsg('Image size must be less than 2MB.')
      return
    }

    setEditPhotoFile(file)
    setEditPhotoPreview(URL.createObjectURL(file))
    setErrorMsg('')
  }

  // Save changes to database
  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaveLoading(true)
    setErrorMsg('')
    try {
      let finalPhotoUrl = editPhotoPreview

      if (editPhotoFile) {
        // Upload photo
        const uploadedUrl = await storageService.uploadProfilePhoto(editPhotoFile, user.id)
        
        // Remove old photo if existed
        if (profileUser?.profile_photo) {
          await storageService.deleteProfilePhoto(profileUser.profile_photo)
        }
        finalPhotoUrl = uploadedUrl
      }

      // Update profile
      await profileService.updateProfile(user.id, {
        full_name: editName,
        bio: editBio,
        travel_interests: editInterests,
        profile_photo: finalPhotoUrl
      })

      // Refresh data
      await fetchProfileData()
      setIsEditing(false)
      
      // Notify other components (like navbar) of profile changes
      window.dispatchEvent(new Event('profile_updated'))
    } catch (err) {
      console.error('Error saving profile changes:', err)
      setErrorMsg(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaveLoading(false)
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
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                  {/* Profile Avatar / Photo */}
                  {profileUser?.profile_photo ? (
                    <img
                      src={profileUser.profile_photo}
                      alt={displayName}
                      className="w-20 h-20 rounded-full object-cover border border-slate-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-white mb-1 truncate">{displayName}</h2>
                    {isOwnProfile && <p className="text-sm text-slate-400 mb-3 truncate">{profileUser?.email}</p>}
                    
                    {/* Follow/Post Stats */}
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-450 mt-2 mb-3">
                      <div>
                        <span className="font-bold text-white mr-1">{posts.length}</span>
                        posts
                      </div>
                      <span className="text-slate-800">•</span>
                      <button
                        onClick={handleOpenFollowers}
                        className="hover:text-white transition"
                      >
                        <span className="font-bold text-white mr-1">{followerCount}</span>
                        followers
                      </button>
                      <span className="text-slate-800">•</span>
                      <button
                        onClick={handleOpenFollowing}
                        className="hover:text-white transition"
                      >
                        <span className="font-bold text-white mr-1">{followingCount}</span>
                        following
                      </button>
                    </div>

                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
                      {profileUser?.role || 'USER'} Account
                    </div>

                    {/* Bio & Interests */}
                    {profileUser?.bio && (
                      <p className="text-sm text-slate-300 mt-2 pr-4">{profileUser.bio}</p>
                    )}

                    {profileUser?.travel_interests && (
                      <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {profileUser.travel_interests.split(',').map((interest, idx) => {
                          const trimmed = interest.trim();
                          if (!trimmed) return null;
                          return (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs bg-slate-900 text-slate-300 border border-slate-850">
                              {trimmed}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button or Follow Button */}
                <div className="flex-shrink-0 w-full sm:w-auto">
                  {isOwnProfile ? (
                    <button
                      onClick={handleOpenEdit}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white text-black hover:bg-slate-200 transition"
                    >
                      Edit Profile
                    </button>
                  ) : (
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-1">Edit Profile</h2>
            <p className="text-slate-400 text-xs mb-6">Update your traveler details and photo.</p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload area */}
              <div className="flex flex-col items-center gap-3 pb-2">
                {editPhotoPreview ? (
                  <img
                    src={editPhotoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border border-slate-850"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-3xl font-bold text-slate-400">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 transition"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                  placeholder="Your Name"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Travel Interests */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Travel Interests</label>
                <input
                  type="text"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                  placeholder="e.g. Hiking, Beaches, Photography (comma separated)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-transparent border border-slate-800 text-white hover:bg-slate-900 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-white text-black hover:bg-slate-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveLoading && <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />}
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
